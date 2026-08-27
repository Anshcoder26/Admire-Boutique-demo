"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [activeImage, setActiveImage] = useState(images[0]);

  const isBase64 = (url: string) => url.startsWith("data:");

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-[30px] border border-[#ebddd5] bg-[#f7f0eb] p-2 shadow-[0_18px_34px_rgba(106,72,60,0.06)]">
        {isBase64(activeImage) ? (
          <img
            src={activeImage}
            alt={name}
            className="h-[420px] w-full rounded-[24px] object-contain md:h-[560px]"
          />
        ) : (
          <Image
            src={activeImage}
            alt={name}
            width={900}
            height={1200}
            className="h-[420px] w-full rounded-[24px] object-contain md:h-[560px]"
          />
        )}
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {images.map((image) => (
          <button
            key={image}
            onClick={() => setActiveImage(image)}
            className={`overflow-hidden rounded-[18px] border transition ${
              activeImage === image ? "border-[#4b1f1d]" : "border-[#ebddd5]"
            }`}
          >
            {isBase64(image) ? (
              <img src={image} alt={name} className="h-24 w-full object-cover md:h-28" />
            ) : (
              <Image src={image} alt={name} width={300} height={360} className="h-24 w-full object-cover md:h-28" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
