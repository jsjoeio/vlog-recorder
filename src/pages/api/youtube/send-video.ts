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

  console.log(req.body.blob, "blob");
  console.log(req.body.metadataUrl, "url");
  console.log(req.body.blobSize, "size");

  return res.status(200).json({ hello: "hello" });

  try {
    const uploadResponse = await fetch(req.body.metadataUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "video/webm",
        "Content-Length": req.body.blobSize,
      },
      body: req.body.blob,
    });
    res.status(uploadResponse.status).json({ message: "hope it worked" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to upload video to YouTube." });
  }
}

export const config = {
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: "4mb",
    },
  },
};
