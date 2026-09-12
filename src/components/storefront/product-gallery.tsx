"use client";

import { useRef, useState } from "react";
import { ProductImage as Image } from "@/components/shared/product-image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  function select(index: number) {
    const element = track.current;
    if (!element) return;
    element.scrollTo({
      left:
        Math.max(0, Math.min(images.length - 1, index)) * element.clientWidth,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  return (
    <section
      className="product-gallery"
      aria-label={`${name} photos`}
      aria-roledescription="carousel"
    >
      <div className="gallery-stage">
        <div
          ref={track}
          className="gallery-track"
          tabIndex={images.length > 1 ? 0 : undefined}
          aria-label="Product photos. Use left and right arrow keys to browse."
          onKeyDown={(event) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
              return;
            event.preventDefault();
            select(
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? images.length - 1
                  : active + (event.key === "ArrowRight" ? 1 : -1),
            );
          }}
          onScroll={(event) => {
            const element = event.currentTarget;
            setActive(
              Math.max(
                0,
                Math.min(
                  images.length - 1,
                  Math.round(element.scrollLeft / element.clientWidth),
                ),
              ),
            );
          }}
        >
          {images.map((src, index) => (
            <div
              className="gallery-slide"
              key={src}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${images.length}`}
            >
              <GalleryImage src={src} name={name} index={index} />
            </div>
          ))}
        </div>
        {images.length > 1 ? (
          <div className="gallery-controls">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label="Previous photo"
              disabled={active === 0}
              onClick={() => select(active - 1)}
            >
              <ChevronLeft />
            </Button>
            <span aria-live="polite" aria-atomic="true">
              {active + 1} / {images.length}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label="Next photo"
              disabled={active === images.length - 1}
              onClick={() => select(active + 1)}
            >
              <ChevronRight />
            </Button>
          </div>
        ) : null}
      </div>
      {images.length > 1 ? (
        <div className="gallery-thumbnails" aria-label="Choose a product photo">
          {images.map((src, index) => (
            <button
              type="button"
              className="gallery-thumbnail"
              aria-label={`Show photo ${index + 1}`}
              aria-pressed={active === index}
              onClick={() => select(index)}
              key={src}
            >
              <Image src={src} alt="" fill sizes="72px" />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function GalleryImage({
  src,
  name,
  index,
}: {
  src: string;
  name: string;
  index: number;
}) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <p className="gallery-unavailable">Photo unavailable</p>
  ) : (
    <Image
      src={src}
      alt={`${name} · photo ${index + 1}`}
      fill
      priority={index === 0}
      sizes="(max-width:640px) 100vw, 50vw"
      onError={() => setFailed(true)}
    />
  );
}
