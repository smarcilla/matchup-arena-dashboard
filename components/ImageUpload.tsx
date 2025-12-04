'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  onUpload: (file: File) => void;
  currentImage?: string;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({
  onUpload,
  currentImage,
  disabled = false,
  className = '',
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Call upload callback
    onUpload(file);
  }, [onUpload]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled) return;

      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) {
        handleFile(file);
      }
    },
    [disabled, handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  return (
    <div
      className={`relative ${className}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />

      <div
        onClick={handleClick}
        className={`
          relative w-full aspect-square rounded-xl border-2 border-dashed
          flex flex-col items-center justify-center cursor-pointer
          transition-all overflow-hidden
          ${
            dragActive
              ? 'border-blue-500 bg-blue-500/10'
              : disabled
              ? 'border-zinc-700 bg-zinc-800/50 cursor-not-allowed'
              : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600 hover:bg-zinc-700'
          }
        `}
      >
        {preview ? (
          <>
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  Click or drop to change
                </span>
              </div>
            )}
          </>
        ) : (
          <>
            <span className="text-4xl mb-2">📷</span>
            <p className="text-zinc-400 text-sm text-center px-4">
              {dragActive ? (
                'Drop image here'
              ) : (
                <>
                  <span className="text-blue-400 font-medium">Click to upload</span>
                  <br />
                  or drag and drop
                </>
              )}
            </p>
            <p className="text-zinc-500 text-xs mt-2">
              PNG, JPG, WebP up to 5MB
            </p>
          </>
        )}
      </div>
    </div>
  );
}
