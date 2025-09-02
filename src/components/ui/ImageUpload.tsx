import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X } from "lucide-react";
import { Button } from "./button";
import FallbackImage from "@/components/shared/FallbackImage"; // Importation du composant FallbackImage

interface ImageUploadProps {
  value?: File | string | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  disabled,
}) => {
  const [preview, setPreview] = useState<string | null>(null);

  React.useEffect(() => {
    if (typeof value === "string") {
      setPreview(value);
    } else if (value instanceof File) {
      const newPreview = URL.createObjectURL(value);
      setPreview(newPreview);
      return () => URL.revokeObjectURL(newPreview);
    }
    return () => {};
  }, [value]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onChange(acceptedFiles[0]);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".gif"] },
    multiple: false,
    disabled,
  });

  const onRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent opening file dialog
    setPreview(null);
    onChange(null);
  };

  return (
    <div
      {...getRootProps()}
      className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
        ${
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-gray-300 hover:border-primary"
        }
        ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <input {...getInputProps()} />
      {preview ? (
        <div className="relative w-full h-48">
          <FallbackImage // Remplacement de <img> par <FallbackImage>
            src={preview}
            alt="Preview"
            className="w-full h-full object-contain rounded-md"
          />
          <Button
            variant="destructive"
            size="icon"
            onClick={onRemove}
            className="absolute top-2 right-2 h-7 w-7"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-2">
          <UploadCloud className="w-12 h-12 text-gray-400" />
          <p className="text-sm text-gray-500">
            {isDragActive
              ? "Déposez l'image ici..."
              : "Glissez-déposez une image, ou cliquez pour sélectionner"}
          </p>
          <p className="text-xs text-gray-400">PNG, JPG, GIF jusqu'à 10Mo</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
