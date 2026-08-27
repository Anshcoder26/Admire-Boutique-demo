'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface InstagramPost {
  id: string;
  image: string;
  caption: string;
  link: string;
}

const curatedFallbackPosts: InstagramPost[] = [
  {
    id: "fallback-1",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
    caption: "Saffron festive edits for your next celebration ✨",
    link: "https://www.instagram.com/admire_boutique.ab/",
  },
  {
    id: "fallback-2",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    caption: "Curated silhouettes with rich ornamental detail 🌸",
    link: "https://www.instagram.com/admire_boutique.ab/",
  },
  {
    id: "fallback-3",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
    caption: "Elegant everyday looks in maroon and gold.",
    link: "https://www.instagram.com/admire_boutique.ab/",
  },
];

export function InstagramFeed() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/instagram/posts');
        const data = await response.json();
        if (data.success && Array.isArray(data.posts) && data.posts.length > 0) {
          setPosts(data.posts);
        } else {
          setPosts(curatedFallbackPosts);
        }
      } catch (error) {
        console.error('Failed to fetch Instagram posts:', error);
        setPosts(curatedFallbackPosts);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (isLoading) {
    return (
      <div className="mt-10 grid gap-4 sm:grid-cols-3 animate-pulse">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="h-64 rounded-[28px] bg-gradient-to-r from-[#D4AF37]/20 to-[#7D1D1D]/20"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-3">
      {(posts.length ? posts : curatedFallbackPosts).map((post) => (
        <Link
          key={post.id}
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          className="group overflow-hidden rounded-[28px] shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
          title={post.caption}
        >
          <div className="relative h-64 w-full overflow-hidden bg-gray-200">
            <img
              src={post.image}
              alt={post.caption}
              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <p className="text-white text-sm font-medium line-clamp-2">
                {post.caption}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
