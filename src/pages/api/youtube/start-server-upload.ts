import { clientEnv } from "@/clientEnv";
import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import fetch from "node-fetch";
import { env } from "process";

const secret = process.env.SECRET;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the user session from NextAuth
  const token = await getToken({ req, secret });

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    if (!clientEnv.success) {
      return res.status(500).json({ error: "Failed to get API url" });
    }

    const url = `${clientEnv.data.NEXT_PUBLIC_API_URL}/upload-youtube`;
    const videoData = {
      fileName: req.body.fileName,
      metaDataUrl: req.body.metaDataUrl,
      videoType: req.body.videoType,
      videoSize: req.body.videoSize,
    };
    const headers = {
      Authorization: `Bearer ${String(token?.accessToken)}`,
      "Content-Type": "application/json",
      Origin:
        env.NEXTAUTH_URL ||
        "https://3000--dev--egghead--jsjoeio--apps.dev.coder.com/",
    };
    const serverResponse = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(videoData),
    });

    const uploadResponse = await serverResponse.json() as {url: string}

    console.log("serverResponse", serverResponse);

    res.status(200).send({
      status: 200,
      message: "server uploading to youtube",
      url: uploadResponse?.url
    });
    // } else {
    //   res.status(500).send({
    //     message: "something went wrong uploading from server to youtube",
    //   });
    // }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to start server upload to YouTube." });
  }
}
