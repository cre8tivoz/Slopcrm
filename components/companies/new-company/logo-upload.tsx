"use client";

import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import Asset from "@/kit/asset";
import Button from "@/components/_ui/button";
import { cn } from "@/lib/utils";
import BuildingIcon from "@/public/assets/images/companies/sidebar/building.svg";

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
/** Logos render at 50px at most; 128px covers 2x screens with room to spare. */
const LOGO_PX = 128;

/**
 * Shrinks an uploaded image to a small WebP data URL (a few KB), so saved
 * companies stay far below the browser's ~5 MB storage quota.
 */
function shrinkLogo(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, LOGO_PX / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale)) || LOGO_PX;
      canvas.height = Math.max(1, Math.round(image.height * scale)) || LOGO_PX;
      const context = canvas.getContext("2d");
      if (!context) return reject(new Error("No canvas"));
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/webp", 0.85));
    };
    image.onerror = () => reject(new Error("Unreadable image"));
    image.src = dataUrl;
  });
}

type LogoUploadProps = {
  value: string | null;
  companyName: string;
  onChange: (value: string | null) => void;
};

export default function LogoUpload({
  value,
  companyName,
  onChange,
}: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hintId = useId();
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function readFile(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError("Use a PNG, JPG, WebP or SVG image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Keep the image under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      shrinkLogo(reader.result)
        .then((logo) => {
          setError(null);
          onChange(logo);
        })
        .catch(() => setError("Couldn't read that image. Try another."));
    };
    reader.readAsDataURL(file);
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    readFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    readFile(event.dataTransfer.files?.[0]);
  }

  const initial = companyName.trim().slice(0, 1).toUpperCase();

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      data-dragging={dragging}
      className="ease-power3-out data-[dragging=true]:border-line-strong flex items-center gap-4 rounded-xl border border-dashed border-transparent transition-[border-color,background-color] duration-150 data-[dragging=true]:bg-white/3"
    >
      <span className="bg-muted flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-[14px] shadow-[0px_6px_6px_0px_rgba(15,15,15,0.24),0px_0px_0px_1.5px_#232323]">
        {value ? (
          <Asset
            type="image"
            src={value}
            alt="Company logo preview"
            width={1}
            height={1}
            fit="contain"
            className="size-9"
          />
        ) : initial ? (
          <span className="h2-style text-soft">{initial}</span>
        ) : (
          <BuildingIcon aria-hidden className="text-subtle size-5" />
        )}
      </span>

      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => inputRef.current?.click()}
            aria-describedby={hintId}
            className="fine:min-h-0 min-h-11"
          >
            {value ? "Replace logo" : "Upload logo"}
          </Button>
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setError(null);
                onChange(null);
              }}
              className="fine:min-h-0 min-h-11"
            >
              Remove
            </Button>
          )}
        </div>
        <span
          id={hintId}
          role={error ? "alert" : undefined}
          className={cn(
            "caption-style block",
            error ? "text-danger" : "text-subtle",
          )}
        >
          {error ??
            "PNG, JPG, WebP or SVG up to 2 MB. You can also drop a file here."}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        onChange={handleInput}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
      />
    </div>
  );
}
