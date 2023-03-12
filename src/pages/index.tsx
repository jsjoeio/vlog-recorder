import React, { useEffect } from "react";
import { RecordButton } from "@/components/RecordButton";
import { VideoRecorder } from "@/components/VideoRecorder";
import { Header } from "@/components/Header";

export type STATE =
  | "initialRender"
  | "checkingPermissions"
  | "initial"
  | "requestingPermissions"
  | "isDeniedPermissions"
  | "isConnectedWebcam"
  | "isRecording"
  | "isStoppedRecording"
  | "isProcessingVideo"
  | "isDoneProcessingVideo";

/* 
  TODO - thinking next step is to add a state like 
  isProcessingVideo so I can show a loading screen
  */

const title = "Finally, a video recorder";
const description = "The easiest way to vlog from your browser.";

export default function Home() {
  const [state, setState] = React.useState<STATE>("initialRender");
  const [hasAudioPermissions, setHasAudioPermissions] = React.useState(false);
  const [hasVideoPermissions, setHasVideoPermissions] = React.useState(false);

  // Effect to check for video and audio access on initial load
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) =>
      devices.forEach((device) => {
        if (device.kind == "audioinput" && device.label) {
          setHasAudioPermissions(true);
        }

        if (device.kind == "videoinput" && device.label) {
          setHasVideoPermissions(true);
        }
      })
    );
  }, []);

  // Effect to update initial state after checking video/audio permissions
  useEffect(() => {
    let timemout: NodeJS.Timeout;
    setState("checkingPermissions");
    if (hasAudioPermissions && hasVideoPermissions) {
      timemout = setTimeout(() => setState("isConnectedWebcam"), 1050);
    } else {
      timemout = setTimeout(() => setState("initial"), 1050);
    }

    return () => {
      clearTimeout(timemout);
    };
  }, [hasAudioPermissions, hasVideoPermissions]);

  if (state === "initialRender" || state === "checkingPermissions") {
    return (
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <progress className="progress h-10 w-96"></progress>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-screen-lg mx-auto px-3 pt-20 pb-32">
        <Header title={title} description={description} state={state} />
        <div>
          <VideoRecorder state={state} setState={setState} />
          <RecordButton state={state} setState={setState} />
        </div>
      </div>
    </>
  );
}
