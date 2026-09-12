import NextImage, { type ImageProps } from "next/image";

// Arbitrary merchant URLs load in the browser, never through our image proxy.
export function ProductImage(props: ImageProps) {
  const optimized =
    typeof props.src === "string" &&
    props.src.startsWith("https://images.unsplash.com/");
  return (
    <NextImage
      {...props}
      unoptimized={!optimized}
      referrerPolicy="no-referrer"
    />
  );
}
