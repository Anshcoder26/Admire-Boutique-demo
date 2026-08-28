import { NextResponse } from "next/server";

interface InstagramErrorResponse {
  error?: {
    message: string;
  };
}

interface InstagramPost {
  id: string;
  caption?: string;
  media_type: string;
  media_url?: string;
  thumbnail_url?: string;
  timestamp: string;
}

interface InstagramResponse {
  data?: InstagramPost[];
  error?: {
    message: string;
  };
}

export async function GET() {
  const accessToken = process.env.NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN;

  if (!accessToken) {
    console.log("[Instagram] No access token configured");
    return NextResponse.json(
      {
        posts: [],
        message: "Instagram integration not configured",
      },
      { status: 200 }
    );
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp&access_token=${accessToken}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      const errorData = (await response.json()) as InstagramErrorResponse;
      console.log("[Instagram] API error:", errorData.error?.message);
      return NextResponse.json(
        {
          posts: [],
          message: "Instagram API unavailable",
        },
        { status: 200 }
      );
    }

    const data = (await response.json()) as InstagramResponse;

    if (!data.data || data.error) {
      console.log("[Instagram] No data or API error:", data.error?.message);
      return NextResponse.json(
        {
          posts: [],
          message: "No Instagram posts available",
        },
        { status: 200 }
      );
    }

    const posts = data.data.slice(0, 9).map((post: InstagramPost) => ({
      id: post.id,
      caption: post.caption || "",
      image:
        post.media_type === "VIDEO"
          ? post.thumbnail_url || ""
          : post.media_url || "",
      link: `https://instagram.com/p/${post.id}`,
      timestamp: post.timestamp,
    }));

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.log("[Instagram] Fetch error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      {
        posts: [],
        message: "Instagram service temporarily unavailable",
      },
      { status: 200 }
    );
  }
}
