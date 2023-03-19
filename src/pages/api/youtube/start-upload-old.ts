import { google } from "googleapis";
import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";

const secret = process.env.SECRET;
const youtube = google.youtube({ version: "v3" });

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
    // Use the user's access token to authenticate with the YouTube API
    const auth = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URL
    );
    auth.setCredentials({
      access_token: String(token?.accessToken),
    });

    const resumableUploadUrl = await youtube.videos.insert({
      snippet: {
        title: "My first video",
        description: "Made in the browser",
      },
      status: {
        privacyStatus: "private",
      },
      resumable: true,
    });

    // Extract the resumable session URI from the response headers
    const location = resumableUploadUrl.headers["location"];

    // Return the resumable session URI to the client
    res.status(200).json({ location });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to upload video to YouTube." });
  }
}
