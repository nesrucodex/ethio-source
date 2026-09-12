"use client";
import { FormSection } from "@/components/shared/form-section";

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useMutation } from "convex/react";
import { motion } from "motion/react";
import {
  Upload,
  ImagePlus,
  ArrowLeft,
  ArrowRight,
  Star,
  Trash2,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { ProductImage } from "@/components/shared/product-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import {
  MAX_PHOTO_BYTES,
  MAX_PRODUCT_PHOTOS,
  PHOTO_TYPES,
  validPhotoUrl,
} from "@/lib/product-photos";

type PhotoRef = { url: string } | { storageId: Id<"_storage"> };
export type PhotoDraft = {
  key: string;
  source?: PhotoRef;
  preview: string;
  label: string;
  file?: File;
  status: "ready" | "uploading" | "error";
  progress?: number;
  error?: string;
};
export function initialPhotos(product: Doc<"products"> | null): PhotoDraft[] {
  if (!product) return [];
  const urls = [product.image, ...(product.images ?? [])];
  const refs = product.photos ?? [...new Set(urls)].map((url) => ({ url }));
  return refs.map((source, index) => ({
    key: `saved-${index}`,
    source,
    preview: "url" in source ? source.url : urls[index],
    label:
      "url" in source
        ? new URL(source.url).hostname
        : `Uploaded photo ${index + 1}`,
    status: "ready",
  }));
}
function checkImage(src: string) {
  return new Promise<void>((resolve, reject) => {
    const image = new window.Image();
    const timer = setTimeout(() => {
      image.src = "";
      reject(
        new Error(
          "The image took too long to load. Check the URL and try again.",
        ),
      );
    }, 15000);
    image.referrerPolicy = "no-referrer";
    image.onload = () => {
      clearTimeout(timer);
      resolve();
    };
    image.onerror = () => {
      clearTimeout(timer);
      reject(
        new Error(
          "This image could not be opened. Use a direct image URL or upload the file.",
        ),
      );
    };
    image.src = src;
  });
}
function uploadFile(
  url: string,
  file: File,
  progress: (value: number) => void,
) {
  return new Promise<Id<"_storage">>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", url);
    request.setRequestHeader("Content-Type", file.type);
    request.timeout = 120000;
    request.upload.onprogress = (event) => {
      if (event.lengthComputable)
        progress(Math.round((event.loaded / event.total) * 100));
    };
    request.onerror = request.ontimeout = () =>
      reject(new Error("Upload interrupted. Check your connection and retry."));
    request.onload = () => {
      try {
        const data = JSON.parse(request.responseText);
        if (request.status < 200 || request.status >= 300 || !data.storageId)
          throw new Error();
        resolve(data.storageId);
      } catch {
        reject(new Error("Upload failed. Please retry."));
      }
    };
    request.send(file);
  });
}
export function ProductPhotoEditor({
  photos,
  onChange,
  disabled,
  onPendingChange,
}: {
  photos: PhotoDraft[];
  onChange: Dispatch<SetStateAction<PhotoDraft[]>>;
  disabled: boolean;
  onPendingChange: (pending: boolean) => void;
}) {
  const generateUrl = useMutation(api.productImages.uploadUrl);
  const register = useMutation(api.productImages.register);
  const picker = useRef<HTMLInputElement>(null);
  const objectUrls = useRef(new Set<string>());
  const [url, setUrl] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    const urls = objectUrls.current;
    return () => {
      urls.forEach((value) => URL.revokeObjectURL(value));
    };
  }, []);
  function update(key: string, values: Partial<PhotoDraft>) {
    onChange((current) =>
      current.map((photo) =>
        photo.key === key ? { ...photo, ...values } : photo,
      ),
    );
  }
  async function upload(photo: PhotoDraft) {
    if (!photo.file) return;
    update(photo.key, { status: "uploading", progress: 0, error: undefined });
    try {
      await checkImage(photo.preview);
      const destination = await generateUrl();
      const storageId = await uploadFile(destination, photo.file, (progress) =>
        update(photo.key, { progress }),
      );
      const result = await register({ storageId });
      if (result.error || !result.url)
        throw new Error(result.error ?? "Upload unavailable");
      update(photo.key, {
        source: { storageId },
        status: "ready",
        progress: 100,
      });
    } catch (reason) {
      update(photo.key, {
        status: "error",
        error:
          reason instanceof Error
            ? reason.message
            : "Upload failed. Please retry.",
      });
    }
  }
  function addFiles(files: File[]) {
    if (disabled || checking) return;
    setError("");
    const drafts: PhotoDraft[] = [];
    const errors: string[] = [];
    for (const file of files) {
      if (photos.length + drafts.length >= MAX_PRODUCT_PHOTOS) {
        errors.push("A product can have up to 8 photos.");
        break;
      }
      if (
        !PHOTO_TYPES.includes(file.type) ||
        file.size === 0 ||
        file.size > MAX_PHOTO_BYTES
      ) {
        errors.push(`${file.name}: use a JPG, PNG, WebP, or AVIF under 8 MB.`);
        continue;
      }
      const preview = URL.createObjectURL(file);
      objectUrls.current.add(preview);
      drafts.push({
        key: crypto.randomUUID(),
        preview,
        file,
        label: file.name,
        status: "uploading",
        progress: 0,
      });
    }
    onChange((current) => [...current, ...drafts]);
    setError(errors.join(" "));
    drafts.forEach((photo) => {
      void upload(photo);
    });
  }
  async function addUrl() {
    const value = url.trim();
    if (!validPhotoUrl(value)) {
      setError("Enter a direct, public HTTPS image URL.");
      return;
    }
    if (
      photos.some(
        (photo) =>
          photo.source && "url" in photo.source && photo.source.url === value,
      )
    ) {
      setError("This photo is already in your gallery.");
      return;
    }
    if (photos.length >= MAX_PRODUCT_PHOTOS) {
      setError("A product can have up to 8 photos.");
      return;
    }
    setChecking(true);
    onPendingChange(true);
    setError("");
    try {
      await checkImage(value);
      onChange((current) =>
        current.length < MAX_PRODUCT_PHOTOS
          ? [
              ...current,
              {
                key: crypto.randomUUID(),
                source: { url: value },
                preview: value,
                label: new URL(value).hostname,
                status: "ready",
              },
            ]
          : current,
      );
      setUrl("");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not load this photo.",
      );
    } finally {
      setChecking(false);
      onPendingChange(false);
    }
  }
  function remove(photo: PhotoDraft) {
    if (objectUrls.current.delete(photo.preview))
      URL.revokeObjectURL(photo.preview);
    onChange((current) => current.filter((item) => item.key !== photo.key));
  }
  function move(index: number, target: number) {
    onChange((current) => {
      const next = [...current];
      const [photo] = next.splice(index, 1);
      next.splice(target, 0, photo);
      return next;
    });
  }
  return (
    <section className="photo-editor" aria-labelledby="photo-editor-title">
      <div className="photo-editor-heading">
        <div>
          <h3 id="photo-editor-title">Product photos</h3>
          <p>A closer look makes all the difference.</p>
        </div>
        <Badge variant="secondary">{photos.length} / 8</Badge>
      </div>
      <div
        className="photo-dropzone"
        data-dragging={dragging}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node))
            setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(Array.from(event.dataTransfer.files));
        }}
      >
        <ImagePlus aria-hidden="true" />
        <div>
          <strong>Drop your photos here</strong>
          <p>JPG, PNG, WebP, or AVIF · up to 8 MB each</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => picker.current?.click()}
          disabled={disabled || checking || photos.length >= 8}
        >
          <Upload data-icon="inline-start" />
          Choose files
        </Button>
        <input
          ref={picker}
          className="sr-only"
          type="file"
          multiple
          accept={PHOTO_TYPES.join(",")}
          aria-label="Upload product photos"
          disabled={disabled || checking || photos.length >= 8}
          onChange={(event) => {
            addFiles(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
      </div>
      <FormSection>
        <Field>
          <FieldLabel htmlFor="photo-url">Or add an image URL</FieldLabel>
          <div className="photo-url-row">
            <Input
              id="photo-url"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  if (!checking && !disabled) void addUrl();
                }
              }}
              placeholder="https://…/product.jpg"
              disabled={disabled || checking}
              aria-describedby="photo-url-help"
            />
            <Button
              type="button"
              variant="outline"
              disabled={
                disabled || checking || !url.trim() || photos.length >= 8
              }
              onClick={() => void addUrl()}
            >
              {checking ? <Loader2 className="animate-spin" /> : <ImagePlus />}{" "}
              {checking ? "Checking…" : "Add photo"}
            </Button>
          </div>
          <p id="photo-url-help" className="text-sm text-muted-foreground">
            Use a direct image link. Photos appear in the order below; the first
            is your cover.
          </p>
        </Field>
      </FormSection>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <ol className="photo-editor-grid">
        {photos.map((photo, index) => (
          <motion.li
            layout="position"
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            key={photo.key}
            className="photo-editor-card"
          >
            <div className="photo-editor-preview">
              <PhotoPreview src={photo.preview} label={photo.label} />
              <span className="photo-cover-label">
                {index === 0 ? "Cover photo" : `Photo ${index + 1}`}
              </span>
              {photo.status === "uploading" ? (
                <div className="photo-upload-progress" role="status">
                  <Loader2 className="animate-spin size-4" />
                  {photo.progress === 100
                    ? "Finishing…"
                    : `Uploading ${photo.progress ?? 0}%`}
                  <progress
                    value={photo.progress ?? 0}
                    max={100}
                    aria-label={`Uploading ${photo.label}`}
                  />
                </div>
              ) : null}
            </div>
            <div className="photo-editor-card-info">
              <p className="truncate" title={photo.label}>
                {photo.label}
              </p>
              {photo.status === "error" ? (
                <div role="alert">
                  <p className="text-sm text-destructive">{photo.error}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => void upload(photo)}
                    disabled={disabled}
                  >
                    <RotateCcw />
                    Retry upload
                  </Button>
                </div>
              ) : null}
              <div className="photo-editor-actions">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  title="Make cover"
                  aria-label={`Make photo ${index + 1} the cover`}
                  disabled={disabled || index === 0}
                  onClick={() => move(index, 0)}
                >
                  <Star />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  title="Move earlier"
                  aria-label={`Move photo ${index + 1} earlier`}
                  disabled={disabled || index === 0}
                  onClick={() => move(index, index - 1)}
                >
                  <ArrowLeft />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  title="Move later"
                  aria-label={`Move photo ${index + 1} later`}
                  disabled={disabled || index === photos.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  <ArrowRight />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  title="Remove photo"
                  aria-label={`Remove photo ${index + 1}`}
                  disabled={disabled}
                  onClick={() => remove(photo)}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          </motion.li>
        ))}
      </ol>
      {!photos.length ? (
        <p className="photo-empty-note">
          Add your first photo to give this product its cover.
        </p>
      ) : null}
    </section>
  );
}
function PhotoPreview({ src, label }: { src: string; label: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <div className="photo-preview-failed">
      <ImagePlus />
      <span>Preview unavailable</span>
    </div>
  ) : (
    <ProductImage
      src={src}
      alt={label}
      fill
      sizes="(max-width:640px) 45vw, 280px"
      onError={() => setFailed(true)}
    />
  );
}
