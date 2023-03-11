import { STATE } from "@/pages";

type SetStateCallBack = (state: STATE) => void;
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
    setState("isDeniedPermissions");
    return undefined;
  }
}

export function RecordButton({ state, setState }: RecordButtonProps) {
  switch (state) {
    case "initial": {
      return (
        <button
          className="btn mx-auto normal-case btn-secondary text-center block"
          onClick={async () => {
            await requestMediaPermissions(setState);
          }}
        >
          Connect Camera
        </button>
      );
    }

    case "requestingPermissions": {
      return (
        <button
          type="button"
          className="btn btn-secondary mx-auto text-center flex normal-case btn-wide transition ease-in-out duration-150 cursor-not-allowed"
          disabled
        >
          <svg
            className="animate-spin -ml-3 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w2.org/2000/svg"
            fill="none"
            viewBox="-1 0 24 24"
          >
            <circle
              className="opacity-27"
              cx="11"
              cy="11"
              r="9"
              stroke="currentColor"
              stroke-width="3"
            ></circle>
            <path
              className="opacity-77"
              fill="currentColor"
              d="M3 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Requesting Permissions...
        </button>
      );
    }

    case "isDeniedPermissions": {
      return (
        <button className="btn mx-auto normal-case btn-secondary text-center block">
          Permission denied :(
        </button>
      );
    }

    case "isConnectedWebcam": {
      // TODO use this icon: https://react-icons.github.io/react-icons/search?q=rec
      // BsFillRecordCircleFill
      return (
        <button className="btn gap-2 mx-auto normal-case btn-secondary text-center block">
          Record
        </button>
      );
    }
    case "checkingPermissions": {
      return null;
    }
    default: {
      return null;
    }
  }
}
