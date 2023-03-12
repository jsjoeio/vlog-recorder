import React, { use, useEffect } from "react";
import { STATE } from "@/pages";
import { motion, AnimatePresence } from "framer-motion";
import { SetStateCallBack } from "@/components/RecordButton";
type FixMeLater = any;
import FileSaver from "file-saver";
import { Loader } from "./Loader";
// Source:
// https://github.com/huynvk/webrtc_demos/tree/master/record_by_browser
// https://medium.com/geekculture/record-and-download-video-in-your-browser-using-javascript-b15efe347e57
const detectMimeType = () => {
  const mimeTypes = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];

  for (let mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }

  return "";
};

const initMediaStream = async () => {
  const constraints: MediaStreamConstraints = {
    audio: {
      echoCancellation: { exact: true },
    },
    video: {
      width: 1920,
      height: 1080,
    },
  };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  return stream;
};

const stopMediaStream = async (stream: MediaStream) => {
  stream.getTracks().forEach((track) => track.stop());
};

const combineBlobs = (recordedBlobs: FixMeLater) => {
  return new Blob(recordedBlobs, { type: "video/webm" });
};

const createBlobURL = (blob: FixMeLater) => {
  const url = window.URL.createObjectURL(blob);
  return url;
};

export const beginRecord = async (
  onStreamReady: FixMeLater,
  onFinished: FixMeLater
) => {
  const stream = await initMediaStream();
  onStreamReady(stream);
  const options = { mimeType: detectMimeType() };
  const recordedBlobs: FixMeLater = [];

  const mediaRecorder = new MediaRecorder(stream, options);
  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      recordedBlobs.push(event.data);
    }
  };
  mediaRecorder.onstop = () => {
    onFinished(recordedBlobs);
    stopMediaStream(stream);
  };

  return mediaRecorder;
};

export const stopPlaying = (videoElement: HTMLVideoElement | null) => {
  if (videoElement) {
    videoElement.pause();
    videoElement.src = "";
    videoElement.srcObject = null;
  }
};

export const playRecordedBlobs = (
  videoElement: HTMLVideoElement | null,
  recordedBlobs: FixMeLater
) => {
  const blob = combineBlobs(recordedBlobs);
  const url = createBlobURL(blob);

  stopPlaying(videoElement);

  if (videoElement) {
    videoElement.controls = true;
    videoElement.src = url;
  }
};

export const playStream = (
  videoElement: HTMLVideoElement | null,
  stream: MediaStream
) => {
  if (videoElement) {
    stopPlaying(videoElement);

    videoElement.srcObject = stream;
    videoElement.play();
  }
};

export const download = (
  recordedBlobs: FixMeLater,
  fileName = "RecordedVideo.webm"
) => {
  const blob = combineBlobs(recordedBlobs);
  return FileSaver.saveAs(blob, fileName);
};

type VideoRecorderProps = {
  state: STATE;
  setState: SetStateCallBack;
};

export function VideoRecorder({ state, setState }: VideoRecorderProps) {
  const [recorded, setRecorded] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);
  const [data, setData] = React.useState([]);
  const [recorder, setRecorder] = React.useState<MediaRecorder | undefined>(
    undefined
  );

  const recordingVideoEl = React.useRef<HTMLVideoElement | null>(null);
  const previewVideoEl = React.useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    async function showLivePreview() {
      try {
        if (!recorder) {
          const mediaRecorder = await beginRecord(
            (stream: MediaStream) =>
              playStream(recordingVideoEl.current, stream),
            (recordedBlobs: FixMeLater) => setData(recordedBlobs)
          );
          setRecorder(mediaRecorder);
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (state === "isConnectedWebcam") {
      showLivePreview();
    }

    if (state === "isRecording" && recorder) {
      recorder.start();
    }

    if (state === "isStoppedRecording") {
      setState("isProcessingVideo");
    }

    if (state === "isProcessingVideo" && recorder) {
      recorder?.stop();
      stopPlaying(recordingVideoEl.current);

      setRecorder(undefined);
      setRecorded(true);

      timeout = setTimeout(() => {
        setState("isDoneProcessingVideo");
      }, 2000);
    }
    if (state === "isDoneProcessingVideo" && previewVideoEl) {
      playRecordedBlobs(previewVideoEl.current, data);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [state]);

  switch (state) {
    case "isRecording":
    case "isConnectedWebcam":
    case "isStoppedRecording": {
      return (
        <AnimatePresence>
          <motion.div
            key="video-recording-isConnectedWebcam"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            exit={{ opacity: 0 }}
            className="card h-52 w-96 bg-base-100 shadow-xl mb-12 mx-auto"
          >
            <motion.video
              key="video-element-isConnectedWebcam"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              exit={{ opacity: 0 }}
              ref={recordingVideoEl}
              playsInline
              autoPlay
              muted
            />
          </motion.div>
        </AnimatePresence>
      );
    }

    case "isProcessingVideo": {
      return <Loader text="Processing video..." />;
    }
    case "isDoneProcessingVideo": {
      return (
        <motion.div
          key="video-recording-isDoneProcessingVideo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          exit={{ opacity: 0 }}
          className="card h-52 w-96 bg-base-100 shadow-xl mb-12 mx-auto"
        >
          <motion.video
            key="video-element-isDoneProcessingVideo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            exit={{ opacity: 0 }}
            ref={previewVideoEl}
            playsInline
            className="mb-12"
          />
          <motion.button
            key="button-isDoneProcessingVideo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            exit={{ opacity: 0 }}
            className="btn gap-2 mx-auto normal-case btn-accent text-center block"
            onClick={() => download(data)}
          >
            Download
          </motion.button>
        </motion.div>
      );
    }
    case "initial":
    case "isDeniedPermissions":
    case "requestingPermissions":
    case "checkingPermissions":
    default: {
      return null;
    }
  }
}
