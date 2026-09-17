import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Admire Boutique",
    short_name: "Admire",
    description: "Premium Indian fashion, elegant kurtis and festive ethnic wear for modern women.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBF7F0",
    theme_color: "#7D1D1D",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/admire-logo.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
