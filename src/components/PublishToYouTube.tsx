import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { clientEnv } from "@/clientEnv";

type PUBLISHING_STATE =
  | "checkingIfLoggedIn"
  | "isLoggedInAndCanPublish"
  | "isNotLoggedIn";

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
    console.log("server resposne", data);
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
          const data = await uploadToServer(blob);
          console.log("data in onclick", data);
        }}
      >
        Upload to YouTube
      </motion.button>
    );
  }

  if (publishingState === "isNotLoggedIn") {
    return null;
  }

  return null;
}
