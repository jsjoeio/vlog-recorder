import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { clientEnv } from "@/clientEnv";
import { LoaderButton } from "./LoaderButton";
import { LoginModal } from "./LoginModal";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
type PUBLISHING_STATE =
  | "checkingIfLoggedIn"
  | "isLoggedInAndCanPublish"
  | "isNotLoggedIn"
  | "isUploadingVideoToServer"
  | "successUploadingVideoToServer"
  | "errorUploadingVideoToServer"
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

// See: https://react.dev/learn/you-might-not-need-an-effect#initializing-the-application
let didInit = false;

export function PublishToYouTube({ blob }: PublishToYouTubeProps) {
  const [publishingState, setPublishingState] =
    useState<PUBLISHING_STATE>("checkingIfLoggedIn");
  const [videoUrl, setVideoUrl] = useState("");
  const { status } = useSession();

  function checkLoginStatus() {
    if (status === "authenticated") {
      setPublishingState("isLoggedInAndCanPublish");
    } else setPublishingState("isNotLoggedIn");
  }

  useEffect(() => {
    if (!didInit) {
      didInit = true;
      if (status === "authenticated") {
        setPublishingState("isLoggedInAndCanPublish");
      } else setPublishingState("isNotLoggedIn");
    }
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
          // setPublishingState("isUploadingVideoToServer");
          // await sleep(2000);
          // setPublishingState("successUploadingVideoToServer");
          setPublishingState("isUploadingVideoToServer");
          // await sleep(2000);
          // setPublishingState("successStartingServerUploadYouTube");
          const data = await uploadToServer(blob);
          console.log("what is the data", data);
          if (data && data.fileName) {
            setPublishingState("successUploadingVideoToServer");
            setPublishingState("isStartingServerUploadYouTube");
            const serverYouTubeData = await startServerUploadYouTube({
              videoSize: data.videoSize,
              videoType: data.videoType,
              fileName: data.fileName,
              metaDataUrl: "https://google.com",
            });
            if (serverYouTubeData.status === 200) {
              setPublishingState("successStartingServerUploadYouTube");
              if (serverYouTubeData.url) {
                setVideoUrl(serverYouTubeData.url);
              }
            }
          } else {
            setPublishingState("errorUploadingVideoToServer");
          }
        }}
      >
        Upload to YouTube (coming soon)
      </motion.button>
    );
  }

  if (publishingState === "isUploadingVideoToServer") {
    return <LoaderButton text="Uploading to server..." />;
  }

  if (publishingState === "successUploadingVideoToServer") {
    return <LoaderButton text="✅ Video uploaded to servers" />;
  }

  if (publishingState === "isStartingServerUploadYouTube") {
    return <LoaderButton text="Uploading to YouTube..." />;
  }

  if (publishingState === "successStartingServerUploadYouTube") {
    return (
      <div className="gap-2 mx-auto normal-case text-center block">
        <p>Successful upload! 🎉</p>
        {videoUrl ? (
          <a
            href={videoUrl}
            target="_blank"
            className="link link-success link-hover"
          >
            Link to YouTube video
          </a>
        ) : null}
      </div>
    );
  }

  if (publishingState === "errorUploadingVideoToServer") {
    return (
      <div className="gap-2 mx-auto normal-case text-center block">
        <p>Something went wrong 😢</p>
      </div>
    );
  }

  if (publishingState === "isNotLoggedIn") {
    return <LoginModal />;
  }

  return (
    <motion.button
      key="publish-to-youtube"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
      exit={{ opacity: 0 }}
      className="btn gap-2 mx-auto normal-case btn-accent text-center block"
      onClick={() => checkLoginStatus()}
    >
      Refresh login status
    </motion.button>
  );
}
