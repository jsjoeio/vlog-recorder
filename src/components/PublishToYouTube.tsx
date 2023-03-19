import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { clientEnv } from "@/clientEnv";
import { LoaderButton } from "./LoaderButton";

type PUBLISHING_STATE =
  | "checkingIfLoggedIn"
  | "isLoggedInAndCanPublish"
  | "isNotLoggedIn"
  | "isUploadingVideoToServer"
  | "successUploadingVideoToServer"
  | "errorUploadingVideoToServer"
  | "isStartingResumableUpload"
  | "successStartingResumableUpload"
  | "errorStartingResumableUpload"
  | "isStartingServerUploadYouTube"
  | "successStartingServerUploadYouTube"
  | "errorStartingServerUploadYouTube";

async function startServerUploadYouTube({
  videoSize,
  videoType,
  fileName,
  metaDataUrl,
}: {
  videoSize: string;
  videoType: string;
  fileName: string;
  metaDataUrl: string;
}) {
  const res = await fetch("/api/youtube/start-server-upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      videoSize,
      videoType,
      metaDataUrl,
      fileName,
    }),
  });

  return await res.json();
}
async function startResumableUpload({
  videoSize,
  videoType,
}: {
  videoSize: string;
  videoType: string;
}) {
  const res = await fetch("/api/youtube/start-upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      videoSize,
      videoType,
    }),
  });

  return await res.json();
}

async function uploadToServer(blob: Blob) {
  if (!clientEnv.success) {
    console.error("failed to get api url from environment");
    return;
  }
  const url = `${clientEnv.data.NEXT_PUBLIC_API_URL}/upload`;
  const formData = new FormData();

  formData.append("file", blob, "recorded-video.webm");
  formData.append("videoSize", blob.size.toString());
  formData.append("videoType", blob.type);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("error uploading video to server", error);
  }
}

type PublishToYouTubeProps = {
  blob: Blob;
};

export function PublishToYouTube({ blob }: PublishToYouTubeProps) {
  const [publishingState, setPublishingState] =
    useState<PUBLISHING_STATE>("checkingIfLoggedIn");
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      setPublishingState("isLoggedInAndCanPublish");
    } else setPublishingState("isNotLoggedIn");
  });

  if (publishingState === "isLoggedInAndCanPublish") {
    return (
      <motion.button
        key="publish-to-youtube"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        exit={{ opacity: 0 }}
        className="btn gap-2 mx-auto normal-case btn-accent text-center block"
        onClick={async () => {
          setPublishingState("isUploadingVideoToServer");
          const data = await uploadToServer(blob);
          if (data.fileName) {
            setPublishingState("successUploadingVideoToServer");
            setPublishingState("isStartingResumableUpload");
            const resumableUploadData = await startResumableUpload({
              videoSize: data.videoSize,
              videoType: data.videoType,
            });

            if (resumableUploadData.metaDataUrl) {
              setPublishingState("successStartingResumableUpload");
              setPublishingState("isStartingServerUploadYouTube");
              const serverYouTubeData = await startServerUploadYouTube({
                videoSize: data.videoSize,
                videoType: data.videoType,
                fileName: data.fileName,
                metaDataUrl: resumableUploadData.metaDataUrl,
              });

              if (serverYouTubeData.status === 200) {
                setPublishingState("successStartingServerUploadYouTube");
              }

              console.log("what did the server say?", serverYouTubeData);
            } else {
              setPublishingState("errorStartingResumableUpload");
            }
          } else {
            setPublishingState("errorUploadingVideoToServer");
          }
        }}
      >
        Upload to YouTube
      </motion.button>
    );
  }

  if (publishingState === "isUploadingVideoToServer") {
    return <LoaderButton text="Uploading to server..." />;
  }

  if (publishingState === "successUploadingVideoToServer") {
    return <LoaderButton text="✅ Video uploaded to servers" />;
  }

  if (publishingState === "isStartingResumableUpload") {
    return <LoaderButton text="Reaching out to YouTube..." />;
  }

  if (publishingState === "successStartingResumableUpload") {
    return <LoaderButton text="✅ YouTube video initialized..." />;
  }

  if (publishingState === "isStartingServerUploadYouTube") {
    return <LoaderButton text="Starting upload to YouTube..." />;
  }

  if (publishingState === "successStartingServerUploadYouTube") {
    return <LoaderButton text="✅✅ Uploaded to youtube" />;
  }

  if (publishingState === "isNotLoggedIn") {
    return null;
  }

  return <LoaderButton text="Uploading..." />;
}
