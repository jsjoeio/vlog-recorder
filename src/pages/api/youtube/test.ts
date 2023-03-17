import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import fetch from "node-fetch";

const secret = process.env.SECRET;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the user session from NextAuth
  const token = await getToken({ req, secret });

  try {
    const url = "https://www.googleapis.com/upload/youtube/v3/videos";
    const metadata = {
      snippet: {
        title: "My Uploaded Video",
        description: "Description of my uploaded video",
      },
    };
    const headers = {
      Authorization: `Bearer ${String(token?.accessToken)}`,
      "Content-Type": "application/json; charset=UTF-8",
      //   "X-Upload-Content-Length": videoData.size.toString(),
      "X-Upload-Content-Length": req.body.videoSize,
      "X-Upload-Content-Type": req.body.videoType,
    };
    const metadataResponse = await fetch(
      `${url}?uploadType=resumable&part=snippet,status`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(metadata),
      }
    );
    console.log(metadataResponse.status, "metadata");
    // TODO@jsjoeio - stopped here. I think it's location with a lowercase
    const metadataUrl = metadataResponse.headers.get("location");
    // console.log(metadataResponse.headers, "headers");

    const daata = await metadataResponse.json();

    if (metadataUrl) {
      res.status(200).send({
        metadataUrl,
        status: metadataResponse.status,
        statusText: metadataResponse.statusText,
      });
    } else {
      res.status(500).send({
        message: "soemting wrong",
        status: metadataResponse.status,
        statusText: metadataResponse.statusText,
        data: daata,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to upload video to YouTube." });
  }
}
