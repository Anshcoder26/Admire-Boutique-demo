import { NextResponse } from 'next/server';

interface InstagramPost {
  id: string;
  image: string;
  caption: string;
  link: string;
}

async function fetchFromInstagramAPI(): Promise<InstagramPost[] | null> {
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!accountId || !accessToken) {
    console.log('Instagram API credentials not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v20.0/${accountId}/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${accessToken}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour (ISR)
      }
    );

    if (!response.ok) {
      console.error(`Instagram API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      console.log('No Instagram posts found');
      return null;
    }

    const posts: InstagramPost[] = data.data
      .filter((post: any) => post.media_type === "IMAGE" || post.media_type === "CAROUSEL_ALBUM")
      .slice(0, 3)
      .map((post: any) => ({
        id: post.id,
        image: post.media_url || "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
        caption: post.caption || "Check our latest collection ✨",
        link: post.permalink || "https://www.instagram.com/admire_boutique.ab/",
      }));

    return posts;
  } catch (error) {
    console.error('Error fetching from Instagram Graph API:', error);
    return null;
  }
}

function getFallbackPosts(): InstagramPost[] {
  // Fallback to environment variables or placeholder
  return [
    {
      id: '1',
      image:
        process.env.NEXT_PUBLIC_INSTA_POST_1 ||
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
      caption: process.env.NEXT_PUBLIC_INSTA_CAPTION_1 || 'Elegant kurtas for every occasion ✨',
      link: 'https://www.instagram.com/admire_boutique.ab/',
    },
    {
      id: '2',
      image:
        process.env.NEXT_PUBLIC_INSTA_POST_2 ||
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      caption: process.env.NEXT_PUBLIC_INSTA_CAPTION_2 || 'Premium ethnic wear collection 🌸',
      link: 'https://www.instagram.com/admire_boutique.ab/',
    },
    {
      id: '3',
      image:
        process.env.NEXT_PUBLIC_INSTA_POST_3 ||
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
      caption: process.env.NEXT_PUBLIC_INSTA_CAPTION_3 || 'Festive looks that shine ✨',
      link: 'https://www.instagram.com/admire_boutique.ab/',
    },
  ];
}

export async function GET() {
  try {
    // Try to fetch from Instagram Graph API first
    const instagramPosts = await fetchFromInstagramAPI();

    if (instagramPosts && instagramPosts.length > 0) {
      return NextResponse.json({
        success: true,
        posts: instagramPosts,
        source: 'instagram-graph-api',
        message: 'Fetched latest posts from Instagram',
      });
    }

    // Fallback to environment variables
    const fallbackPosts = getFallbackPosts();

    return NextResponse.json(
      {
        success: true,
        posts: fallbackPosts,
        source: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID ? 'fallback-after-api-error' : 'environment-config',
        message: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
          ? 'Using fallback (Instagram API error)'
          : 'Using environment configuration',
        note: 'Set INSTAGRAM_BUSINESS_ACCOUNT_ID and INSTAGRAM_ACCESS_TOKEN for automatic fetching',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in Instagram API route:', error);

    // Return fallback even on error
    const fallbackPosts = getFallbackPosts();

    return NextResponse.json(
      {
        success: false,
        posts: fallbackPosts,
        source: 'fallback-error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 200 } // Return 200 with fallback data for reliability
    );
  }
}


