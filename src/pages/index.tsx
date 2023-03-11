import React, { useEffect } from "react";
import { RecordButton } from "@/components/RecordButton";

export type STATE =
  | "checkingPermissions"
  | "initial"
  | "requestingPermissions"
  | "isConnectedWebcam"
  | "isDeniedPermissions";

const title = "Finally, a video recorder";
const description = "The easiest way to vlog from your browser.";

export default function Home() {
  const [state, setState] = React.useState<STATE>("checkingPermissions");
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
    if (hasAudioPermissions && hasVideoPermissions) {
      setState("isConnectedWebcam");
    } else {
      setState("initial");
    }
  }, [hasAudioPermissions, hasVideoPermissions]);

  return (
    <>
      <div className="max-w-screen-lg mx-auto px-3 pt-20 pb-32">
        <header className="text-center">
          <h1 className="text-5xl text-gray-900 font-bold whitespace-pre-line leading-hero">
            {title}
          </h1>
          <div className="text-2xl mt-4 mb-16">{description}</div>
        </header>
        <div>
          <RecordButton state={state} setState={setState} />
        </div>
      </div>
    </>
  );
}
