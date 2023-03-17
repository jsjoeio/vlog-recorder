import { google } from "googleapis";
import { getServerSession } from "next-auth/next";
import type { NextApiRequest, NextApiResponse } from "next";
import authOptions from "./auth/[...nextauth]";
import { getToken } from "next-auth/jwt";

const secret = process.env.SECRET;
// Set up the YouTube API client
const youtube = google.youtube({ version: "v3" });

// Set up the YouTube API client
// const youtube = google.youtube({ version: "v3" });

// Define your /api route handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the user session from NextAuth
  const session = await getServerSession(req);
  const token = await getToken({ req, secret });

  //   Check if the user is authenticated
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Get the video file from the request body
  const videoFile = req.body.video;

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

    // Upload the video file to YouTube using the YouTube API
    const uploadResponse = await youtube.videos.insert({
      part: ["snippet", "status"],
      auth,
      media: {
        mimeType: videoFile.type,
        body: videoFile,
      },
      requestBody: {
        snippet: {
          title: "My Uploaded Video",
          description: "This is a video I recorded in my browser.",
          categoryId: "22",
        },
        status: {
          privacyStatus: "private",
        },
      },
    });
    // Get the ID of the newly created video resource
    const videoId = uploadResponse.data.id;

    // Return a response to the client
    res.status(200).json({ videoId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to upload video to YouTube." });
  }
}
