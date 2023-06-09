import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { clientEnv } from "@/clientEnv";
import { STATE } from "@/pages";
import { motion, AnimatePresence } from "framer-motion";
import { SetStateCallBack } from "@/components/RecordButton";
type FixMeLater = any;
import FileSaver from "file-saver";
import { Loader } from "./Loader";
import { PublishToYouTube } from "./PublishToYouTube";
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

async function updateCamera(
  videoElement: HTMLVideoElement | null,
  cameraDeviceId: string,
  mediaRecorder: MediaRecorder,
  setData: (data: any) => void,
  setRecorder: (data: any) => void
) {
  const currentAudioTrack = mediaRecorder.stream.getAudioTracks()[0];
  const currentAudioConstraints = currentAudioTrack.getConstraints();
  const oldVideoTrack = mediaRecorder.stream.getVideoTracks()[0];
  const oldVideoConstraints = oldVideoTrack.getConstraints();
  const newConstraints: MediaStreamConstraints = {
    audio: {
      ...currentAudioConstraints,
    },
    video: {
      ...oldVideoConstraints,
      deviceId: cameraDeviceId,
    },
  };
  currentAudioTrack.stop();
  oldVideoTrack.stop();

  const newStream = await navigator.mediaDevices.getUserMedia(newConstraints);
  stopPlaying(videoElement);

  const newMediaRecorder = await beginRecord(
    (stream: MediaStream) => playStream(videoElement, stream),
    (recordedBlobs: FixMeLater) => setData(recordedBlobs),
    newStream
  );
  setRecorder(newMediaRecorder);
}

async function updateMicrophone(
  videoElement: HTMLVideoElement | null,
  microphoneDeviceId: string,
  mediaRecorder: MediaRecorder,
  setData: (data: any) => void,
  setRecorder: (data: any) => void
) {
  const oldAudioTrack = mediaRecorder.stream.getAudioTracks()[0];
  const oldAudioConstraints = oldAudioTrack.getConstraints();
  const currentVideoTrack = mediaRecorder.stream.getVideoTracks()[0];
  const currentVideoConstraints = currentVideoTrack.getConstraints();
  const newConstraints: MediaStreamConstraints = {
    audio: {
      ...oldAudioConstraints,
      deviceId: microphoneDeviceId,
    },
    video: {
      ...currentVideoConstraints,
    },
  };
  oldAudioTrack.stop();
  currentVideoTrack.stop();

  const newStream = await navigator.mediaDevices.getUserMedia(newConstraints);
  stopPlaying(videoElement);

  const newMediaRecorder = await beginRecord(
    (stream: MediaStream) => playStream(videoElement, stream),
    (recordedBlobs: FixMeLater) => setData(recordedBlobs),
    newStream
  );
  setRecorder(newMediaRecorder);
}

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

async function pingApi() {
  if (clientEnv.success) {
    if (clientEnv.data.NEXT_PUBLIC_USE_API_URL === "true") {
      const apiUrl = `${clientEnv.data.NEXT_PUBLIC_API_URL}/healthz`;
      try {
        const res = await fetch(apiUrl);
        return res;
      } catch (error) {
        console.error("error pinging api", error);
      }
    }
  }
}

const uploadVideo = async (videoData: Blob, token: string) => {
  try {
    const url = "https://www.googleapis.com/upload/youtube/v3/videos";
    const metadata = {
      snippet: {
        title: "My Uploaded Video",
        description: "Description of my uploaded video",
      },
    };
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Length": videoData.size.toString(),
      "X-Upload-Content-Type": videoData.type,
    };
    const metadataResponse = await fetch(
      `${url}?uploadType=resumable&part=snippet,status`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(metadata),
      }
    );
    const metadataUrl = metadataResponse.headers.get("Location");

    if (metadataUrl) {
      console.log("metadata url");
      // Use the returned metadata URL to make the resumable upload request
      const uploadResponse = await fetch(metadataUrl, {
        method: "PUT",
        headers: {
          "Content-Type": videoData.type,
          "Content-Length": videoData.size.toString(),
        },
        body: videoData,
      });

      console.log(uploadResponse, "upload response");

      console.log("Video uploaded successfully!");
    }
  } catch (error) {
    console.error("something went wrong", error);
  }
};

const sendVideo = async (metadataUrl: string, blob: FixMeLater) => {
  const formData = new FormData();
  formData.append("blob", blob);
  formData.append("metadataUrl", metadataUrl);
  formData.append("blobSize", blob.size.toString());

  const response = await fetch("/api/youtube/send-video", {
    method: "POST",
    body: formData,
  });

  return await response.json();
};

export const beginRecord = async (
  onStreamReady: FixMeLater,
  onFinished: FixMeLater,
  newStream?: MediaStream
) => {
  let stream: MediaStream;
  if (newStream) {
    stream = newStream;
  } else {
    stream = await initMediaStream();
  }
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
  fileName = "recorded-video.webm"
) => {
  const blob = combineBlobs(recordedBlobs);
  return FileSaver.saveAs(blob, fileName);
};

type VideoRecorderProps = {
  state: STATE;
  setState: SetStateCallBack;
  cameraDeviceId: string;
  microphoneDeviceId: string;
};

export function VideoRecorder({
  state,
  setState,
  cameraDeviceId,
  microphoneDeviceId,
}: VideoRecorderProps) {
  const { data: session } = useSession();
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
      pingApi();
    }

    if (state === "isRecording" && recorder) {
      recorder.start();
      pingApi();
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

  // Effect to update camera or microphone if
  // user changes either.
  // Only allowed before they start recording.
  useEffect(() => {
    const isConnectedWebcam = state === "isConnectedWebcam";
    // TODO@jsjoeio - also this logic is bad because always runs almost
    if (isConnectedWebcam && cameraDeviceId && recorder) {
      console.log("camera updated", cameraDeviceId);
      updateCamera(
        recordingVideoEl.current,
        cameraDeviceId,
        recorder,
        setData,
        setRecorder
      );
    }
  }, [cameraDeviceId]);

  useEffect(() => {
    const isConnectedWebcam = state === "isConnectedWebcam";

    // TODO@jsjoeio - also this logic is bad because always runs almost
    if (isConnectedWebcam && microphoneDeviceId && recorder) {
      updateMicrophone(
        recordingVideoEl.current,
        microphoneDeviceId,
        recorder,
        setData,
        setRecorder
      );
    }
  }, [microphoneDeviceId]);

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
            className="card h-[18rem] w-[32rem] bg-base-100 shadow-xl mb-6 mx-auto"
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
      return <Loader isHero={false} text="Processing video..." />;
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
          <div className="flex">
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
            <PublishToYouTube blob={combineBlobs(data)} />
          </div>
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
