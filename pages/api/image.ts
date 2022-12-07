// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

interface Data {
  prompt: string;
  model: string;
  width: number;
  height: number;
}

interface Error {
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | Error>
) {
  if (req.method !== "POST") {
    res.status(400).json({ error: "only POST requests are allowed" });
    return;
  }

  if (!req.body.prompt) {
    res.status(400).json({ error: "prompt is required" });
    return;
  }

  // make request to image api and return data
  const response = await fetch(
    `https://api.stability.ai/v1alpha/generation/${
      req.body.model || "stable-diffusion-v1-5"
    }/text-to-image`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.API_KEY || "",
        Accept: "application/json",
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: req.body.prompt,
            weight: 1,
          },
        ],
        samples: req.body.count || 1,
        sampler: "K_DPMPP_2S_ANCESTRAL",
        clip_guidance_preset: "FAST_BLUE",
        width: req.body.width || 512,
        height: req.body.height || 512,
      }),
    }
  );

  console.log(response.headers);

  const data = await response.json();
  res.status(200).json(data);
}
