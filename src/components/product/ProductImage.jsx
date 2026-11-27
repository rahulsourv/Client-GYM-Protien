import Image from "next/image";

const isCutout = (src) => src.endsWith(".png");

/**
 * Packshot on a seamless light stage. Source photos have white backgrounds, so
 * they're multiplied into the stage instead of sitting in a white box.
 * Sources are low-res for some brands, so the image never upscales past its
 * native width.
 */
export default function ProductImage({
  image,
  sizes = "(min-width: 1024px) 25vw, 50vw",
  priority = false,
  className = "",
  imgClassName = "",
  stage = true,
  pad = "12%",
}) {
  if (!image) return <div className={`stage ${className}`} />;
  return (
    <div className={`${/\b(absolute|fixed)\b/.test(className) ? "" : "relative"} overflow-hidden ${stage ? "stage" : ""} ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center" style={{ padding: pad }}>
        <div className="relative h-full w-full" style={{ maxWidth: image.width * 1.5, maxHeight: image.height * 1.5 }}>
          <Image
            src={image.src}
            unoptimized={image.unoptimized}
            alt={image.alt}
            fill
            sizes={sizes}
            priority={priority}
            className={`object-contain ${stage && !isCutout(image.src) ? "blend" : ""} ${imgClassName}`}
          />
        </div>
      </div>
    </div>
  );
}
