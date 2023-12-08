/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
import {
  FrameShapeUtil,
  getSvgAsImage,
  HTMLContainer,
  TLEventMapHandler,
  TLFrameShape,
  TLShape,
  useEditor,
} from "@tldraw/tldraw";
import { useContext } from 'react';
import { PromptContext } from '../components/PromptContext'; // Adjust the path as needed

import { blobToDataUri } from "@/utils/blob";
import { debounce } from "@/utils/debounce";
import * as fal from "@fal-ai/serverless-client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import result from "postcss/lib/result";

// See https://www.fal.ai/models/latent-consistency-sd

const DEBOUNCE_TIME = 0.0; // Adjust as needed
// const URL = "wss://110602490-lcm-plexed-sd15-i2i.gateway.alpha.fal.ai/ws";
// const URL = "wss://110602490-lcm-plexed-sd15-i2i.gateway.alpha.fal.ai/ws?fal_key_id=c860a171-934a-43d9-a173-712bc32ad1e4&fal_key_secret=2e86b8b70bd6c27500a1855cb2eb155b";

const URL = `wss://110602490-lcm-sd15-i2i.gateway.alpha.fal.ai/ws?fal_key_id=${process.env.NEXT_PUBLIC_FAL_KEY_ID}&fal_key_secret=${process.env.NEXT_PUBLIC_FAL_KEY_SECRET}`;


type Input = {
  prompt: string;
  image_url: string;
  sync_mode: boolean;
  seed: number;
  strength?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
  enable_safety_checks?: boolean;
};

type Output = {
  images: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  seed: number;
  num_inference_steps: number;
};

export class LiveImageShapeUtil extends FrameShapeUtil {
  static override type = "live-image" as any;

  override getDefaultProps(): { w: number; h: number; name: string } {
    return {
      w: 512,
      h: 512,
      name: "a painting that looks amazing",
      
    };
  }

  override component(shape: TLFrameShape) {
    const { setImageDataUri } = useContext(PromptContext); // Get setImageDataUri function

   const { promptText,setPromptText, strength, guidanceScale,seed,numInferenceSteps,imageDataUri} = useContext(PromptContext);
    const editor = useEditor();
    const component = super.component(shape);
    const [image, setImage] = useState<string | null>(null);


    const imageDigest = useRef<string | null>(null);
    const startedIteration = useRef<number>(0);
    const finishedIteration = useRef<number>(0);
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setPromptText(event.target.value);
    };
    //===== SOCKET =====//
    const webSocketRef = useRef<WebSocket | null>(null);
    const isReconnecting = useRef(false);

    const connect = useCallback(() => {
      webSocketRef.current = new WebSocket(URL);
      webSocketRef.current.onopen = () => {
        // console.log("WebSocket Open");
      };

      webSocketRef.current.onclose = () => {
        // console.log("WebSocket Close");
      };

      webSocketRef.current.onerror = (error) => {
        // console.error("WebSocket Error:", error);
      };

      webSocketRef.current.onmessage = (message) => {
        try {
          const data = JSON.parse(message.data);
          // console.log("WebSocket Message:", data);
          if (data.images && data.images.length > 0) {
            setImage(data.images[0].url); // Existing code to set image
            setImageDataUri(data.images[0].url); // Set the imageDataUri for download
          }
        } catch (e) {
          console.error("Error parsing the WebSocket response:", e);
        }
      };
    },  [setImageDataUri]);

    const disconnect = useCallback(() => {
      webSocketRef.current?.close();
    }, []);

    
    const sendMessage = useCallback(
      async (message: string) => {
        if (
          !isReconnecting.current &&
          webSocketRef.current?.readyState !== WebSocket.OPEN
        ) {
          isReconnecting.current = true;
          connect();
        }

        if (
          isReconnecting.current &&
          webSocketRef.current?.readyState !== WebSocket.OPEN
        ) {
          await new Promise<void>((resolve) => {
            const checkConnection = setInterval(() => {
              if (webSocketRef.current?.readyState === WebSocket.OPEN) {
                clearInterval(checkConnection);
                resolve();
              }
            }, 100);
          });
          isReconnecting.current = false;
        }
        webSocketRef.current?.send(message);
      },
      [connect]
    );

    const sendCurrentData = useMemo(() => {
      return debounce((message: string) => {
        const messageObject = JSON.parse(message);
    
        // Use context values directly in the updated message
        const updatedMessage = JSON.stringify({
          ...messageObject,
          prompt: promptText, // Use promptText from context
          seed: seed, // Use seed from context
          strength: strength, // Use strength from context
          guidance_scale: guidanceScale, // Use guidanceScale from context
          num_inference_steps: numInferenceSteps, 
        });
    
        // Log the message details with updated values
        console.log('Sending message with details:');
        console.log(`Prompt: ${promptText}`);
        console.log(`Seed: ${seed}`);
        console.log(`Sync Mode: ${messageObject.sync_mode}`);
        console.log(`Strength: ${strength}`);
        console.log(`Guidance Scale: ${guidanceScale}`);
        console.log(`Num Inference Steps: ${messageObject.num_inference_steps}`);
        console.log(`Enable Safety Checks: ${messageObject.enable_safety_checks}`);
    
        sendMessage(updatedMessage);
      }, DEBOUNCE_TIME);
    }, [sendMessage, promptText, strength, guidanceScale,numInferenceSteps, seed]);
    

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onDrawingChange = useCallback(
      debounce(async () => {
        // TODO get actual drawing bounds
        // const bounds = new Box2d(120, 180, 512, 512);

        const iteration = startedIteration.current++;

        const shapes = Array.from(editor.getShapeAndDescendantIds([shape.id]))
          .filter((id) => id !== shape.id)
          .map((id) => editor.getShape(id)) as TLShape[];

        // Check if should submit request
        const shapesDigest = JSON.stringify(shapes);
        if (shapesDigest === imageDigest.current) {
          return;
        }
        imageDigest.current = shapesDigest;

        const svg = await editor.getSvg(shapes, { background: true });
        if (iteration <= finishedIteration.current) return;

        if (!svg) {
          return;
        }
        const image = await getSvgAsImage(svg, editor.environment.isSafari, {
          type: "png",
          quality: 1,
          scale: 1,
        });

        if (iteration <= finishedIteration.current) return;

        if (!image) {
          return;
        }

        const prompt =
          editor.getShape<TLFrameShape>(shape.id)?.props.name ?? "";
        const imageDataUri = await blobToDataUri(image);

        const request = {
          image_url: imageDataUri,
          prompt: promptText,
          sync_mode: true,
          strength: strength,
          seed: seed,
          guidance_scale: guidanceScale,
          num_inference_steps: numInferenceSteps, // Included from context
          enable_safety_checks: false,
        };
        

        sendCurrentData(JSON.stringify(request));

        if (iteration <= finishedIteration.current) return;

        // const result = await fal.run<Input, Output>(LatentConsistency, {
        //   input: {
        //     image_url: imageDataUri,
        //     prompt,
        //     sync_mode: true,
        //     strength: 0.6,
        //     seed: 42, // TODO make this configurable in the UI
        //     enable_safety_checks: false,
        //   },
        //   // Disable auto-upload so we can submit the data uri of the image as is
        //   autoUpload: true,
        // });
        if (iteration <= finishedIteration.current) return;

        finishedIteration.current = iteration;
        // if (result && result.images.length > 0) {
        //   setImage(result.images[0].url);
        // }
      }, 0),
      [sendMessage,seed,numInferenceSteps, promptText, strength, guidanceScale]
    );

    useEffect(() => {
      const onChange: TLEventMapHandler<"change"> = (event) => {
        if (event.source !== "user") {
          return;
        }
        if (
          Object.keys(event.changes.added).length ||
          Object.keys(event.changes.removed).length ||
          Object.keys(event.changes.updated).length
        ) {
          onDrawingChange();
        }
      };
      editor.addListener("change", onChange);
      return () => {
        editor.removeListener("change", onChange);
      };
    }, [editor, onDrawingChange]);

    return (
      <HTMLContainer>
       <div style={{
          width: shape.props.w,
          height: shape.props.h,
          border: '2px solid black', // Adding a black border
        }}>
          {/* Display the prompt text above the shape */}
          <div style={{ marginBottom: "10px" }}>
            {/* <span style={{ fontWeight: "bold" }}>Prompt:</span> {promptText} */}
          </div>
      
         
          {/* Existing image rendering logic */}
          {image && (
            <img
              src={image}
              alt=""
              width={shape.props.w}
              height={shape.props.h}
              style={{
                position: "relative",
                left: shape.props.w,
                width: shape.props.w,
                height: shape.props.h,
              }}
            />
            
          )}
        </div>
      </HTMLContainer>
    );
  }
}
