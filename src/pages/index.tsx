import React, { useEffect } from "react";
import { RecordButton } from "@/components/RecordButton";
import { VideoRecorder } from "@/components/VideoRecorder";
import { Header } from "@/components/Header";
import { Loader } from "@/components/Loader";
import { useRouter } from "next/router";
import { Navbar } from "@/components/Navbar";
import { SpeakerNotes } from "@/components/SpeakerNotes";

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
  const router = useRouter();
  const [state, setState] = React.useState<STATE>("initialRender");
  const [hasAudioPermissions, setHasAudioPermissions] = React.useState(false);
  const [hasVideoPermissions, setHasVideoPermissions] = React.useState(false);

  // Effect to close window if user signed in from popup
  // useEffect(() => {
  //   console.log("checking query param", router.query);
  //   if (router.query.signedIn) {
  //     console.log("found it");
  //     window.opener.close();
  //   }
  //   const handleWindowClose = () => {
  //     if (router.query.signedIn) {
  //       console.log("found it");
  //       window.close();
  //     }
  //   };

  //   window.addEventListener("beforeunload", handleWindowClose);

  //   return () => {
  //     window.removeEventListener("beforeunload", handleWindowClose);
  //   };
  // }, [router.query.signedIn]);

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
      timemout = setTimeout(() => setState("isConnectedWebcam"), 1250);
    } else {
      timemout = setTimeout(() => setState("initial"), 1050);
    }

    return () => {
      clearTimeout(timemout);
    };
  }, [hasAudioPermissions, hasVideoPermissions]);

  if (state === "initialRender" || state === "checkingPermissions") {
    return <Loader isHero />;
  }

  return (
    <>
      <Navbar state={state} />
      <div className="max-w-screen-lg mx-auto px-3 pb-32">
        <Header title={title} description={description} state={state} />
        <div>
          <VideoRecorder state={state} setState={setState} />
          <RecordButton state={state} setState={setState} />
          <SpeakerNotes state={state} />
        </div>
      </div>
    </>
  );
}
