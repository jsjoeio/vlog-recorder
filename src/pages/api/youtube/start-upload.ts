import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import fetch from "node-fetch";

const secret = process.env.SECRET;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("call to start-upload");
  const token = await getToken({ req, secret });

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const url = "https://www.googleapis.com/upload/youtube/v3/videos";
    const videoMetadata = {
      snippet: {
        title: "My Uploaded Video",
        description: "Video uploaded from my vlog recorder",
      },
    };
    const headers = {
      Authorization: `Bearer ${String(token?.accessToken)}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Length": req.body.videoSize,
      "X-Upload-Content-Type": req.body.videoType,
    };
    const metadataResponse = await fetch(
      `${url}?uploadType=resumable&part=snippet,status`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(videoMetadata),
      }
    );
    console.log("start-upload response", metadataResponse.headers);
    const metaDataUrl =
      metadataResponse.headers.get("location") ||
      metadataResponse.headers.get("Location");

    console.log(metaDataUrl, "what is this");

    if (metaDataUrl) {
      res.status(200).send({
        metaDataUrl,
        status: metadataResponse.status,
        statusText: metadataResponse.statusText,
      });
    } else {
      res.status(500).send({
        message: "soemting wrong",
        status: metadataResponse.status,
        statusText: metadataResponse.statusText,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to start resumable upload." });
  }
}
