import { NextResponse } from "next/server"
import { withApiGateway, type ApiContext } from "@/lib/api-middleware"

export const dynamic = "force-dynamic"

export const POST = withApiGateway(async (req: Request, { user }: ApiContext) => {
  const body = await req.json()
  const { url } = body

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Missing or invalid URL" }, { status: 400 })
  }

  let platform = "UNKNOWN"
  if (url.includes("youtube.com") || url.includes("youtu.be")) platform = "YOUTUBE"
  else if (url.includes("tiktok.com")) platform = "TIKTOK"
  else if (url.includes("instagram.com")) platform = "INSTAGRAM"

  if (platform === "UNKNOWN") {
    return NextResponse.json(
      { error: "Unsupported platform. Please use YouTube, TikTok, or Instagram." },
      { status: 400 }
    )
  }

  console.log(`[GENERATE] user=${user.email} plan=${user.plan} platform=${platform} url=${url}`)

  // Architecture placeholder — transcript extraction and AI generation
  // will be wired in once the processing pipeline is built.
  const extractedTranscript = `Extracted audio from ${platform} video at ${url}`

  const generatedSEO = {
    title: `How AI is saving businesses 10 hours a week 🤯`,
    caption: `Stop wasting time on manual marketing! If you run a small business, leveraging AI tools is the easiest way to buy your time back.\n\nWe analyzed this ${platform} video to bring you the exact framework. Drop a 🚀 in the comments if you are ready to scale!`,
    hashtags: `#SmallBusinessTips #AITools #TechFounder #MarketingStrategy`,
  }

  return NextResponse.json({
    success: true,
    platform,
    transcript: extractedTranscript,
    seoData: generatedSEO,
  })
})
