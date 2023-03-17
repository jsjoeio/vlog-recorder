// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { getToken } from "next-auth/jwt";

const secret = process.env.SECRET;

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const token = await getToken({ req, secret })
  console.log("JSON Web Token", token)

  res.status(200).json({ name: "John Doe" });


}
