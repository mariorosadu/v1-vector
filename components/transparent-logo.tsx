"use client";

import { useEffect, useRef, useState } from "react";

interface TransparentLogoProps {
  src: string;
  alt: string;
  className?: string;
  threshold?: number;
}

export function TransparentLogo({
  src,
  alt,
  className = "",
  threshold = 30,
}: TransparentLogoProps) {
  const [processedSrc, setProcessedSrc] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Define regions to clear (artifacts)
      // Top-left artifact: roughly top 8% and left 15%
      const topLeftCutoffY = img.height * 0.12;
      const topLeftCutoffX = img.width * 0.18;
      
      // Bottom-right Gemini logo: roughly bottom 12% and right 10%
      const bottomRightCutoffY = img.height * 0.88;
      const bottomRightCutoffX = img.width * 0.90;

      // Process pixels - make dark pixels transparent and clear artifact regions
      for (let i = 0; i < data.length; i += 4) {
        const pixelIndex = i / 4;
        const x = pixelIndex % canvas.width;
        const y = Math.floor(pixelIndex / canvas.width);
        
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Clear top-left artifact region
        if (y < topLeftCutoffY && x < topLeftCutoffX) {
          data[i + 3] = 0;
          continue;
        }
        
        // Clear bottom-right Gemini logo region
        if (y > bottomRightCutoffY && x > bottomRightCutoffX) {
          data[i + 3] = 0;
          continue;
        }

        // If pixel is close to black, make it transparent
        if (r < threshold && g < threshold && b < threshold) {
          data[i + 3] = 0; // Set alpha to 0
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setProcessedSrc(canvas.toDataURL("image/png"));
    };

    img.src = src;
  }, [src, threshold]);

  return (
    <>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {processedSrc ? (
        <img src={processedSrc || "/placeholder.svg"} alt={alt} className={className} />
      ) : (
        <img src={src || "/placeholder.svg"} alt={alt} className={`${className} opacity-0`} />
      )}
    </>
  );
}
