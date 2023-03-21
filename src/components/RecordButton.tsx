import { BsRecordCircle, BsRecordCircleFill } from "react-icons/bs";
import { STATE } from "@/pages";
import { DateDisplay } from "./DateDisplay";
import { AnimatePresence, motion } from "framer-motion";
import { TimestampCounter } from "./TimestampCounter";
import { LoaderButton } from "./LoaderButton";

export type SetStateCallBack = (state: STATE) => void;
type RecordButtonProps = {
  state: STATE;
  setState: SetStateCallBack;
};
async function requestMediaPermissions(
  setState: SetStateCallBack
): Promise<MediaStream | undefined> {
  try {
    setState("requestingPermissions");
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    stream.getTracks().forEach((track) => track.stop());
    setState("isConnectedWebcam");
    return stream;
  } catch (error) {
    console.error("There was an error requesting permissions", error);
    setState("isDeniedPermissions");
    return undefined;
  }
}

export function RecordButton({ state, setState }: RecordButtonProps) {
  switch (state) {
    case "initial": {
      return (
        <button
          className="btn mx-auto normal-case btn-primary text-center block"
          onClick={async () => {
            await requestMediaPermissions(setState);
          }}
        >
          Connect Camera
        </button>
      );
    }

    case "requestingPermissions": {
      return <LoaderButton text="Requesting Permissions..." />;
    }

    case "isDeniedPermissions": {
      return (
        <div>
          <button className="btn mx-auto normal-case btn-secondary text-center block mb-4">
            Permission denied :(
          </button>
          <small className="text-center block">
            Without webcam and microphone access, we can&apos;t record videos
            for you 😢
          </small>
          <small className="text-center block">
            We suggest resetting permissions and reloading the app.
          </small>
        </div>
      );
    }

    case "isConnectedWebcam":
    case "isStoppedRecording": {
      return (
        <AnimatePresence>
          <motion.button
            key="start-recording"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
            exit={{ opacity: 0 }}
            className="btn gap-2 normal-case mx-auto text-center block flex uppercase btn-outline btn-lg"
            onClick={() => {
              setState("isRecording");
            }}
          >
            <BsRecordCircle />{" "}
            <span className="uppercase tracking-wider font-bold">rec</span>
          </motion.button>
        </AnimatePresence>
      );
    }
    case "isRecording": {
      return (
        <div className="flex items-center justify-center mx-auto">
          <div className="flex items-center justify-center px-6">
            <TimestampCounter />
          </div>
          <button
            className="btn gap-2 normal-case btn-secondary text-center block flex btn-error btn-lg"
            onClick={() => {
              setState("isStoppedRecording");
            }}
          >
            <BsRecordCircleFill />
            <span className="uppercase tracking-wider font-bold">rec</span>
          </button>
          <div className="w-24 flex items-center justify-center">
            <DateDisplay date={new Date()} />
          </div>
        </div>
      );
    }
    case "isProcessingVideo":
    case "checkingPermissions":
    default: {
      return null;
    }
  }
}
