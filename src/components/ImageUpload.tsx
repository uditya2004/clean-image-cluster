
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "./ui/card";
import { Upload } from "lucide-react";

interface ImageUploadProps {
  onUpload: (files: File[]) => void;
}

export const ImageUpload = ({ onUpload }: ImageUploadProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onUpload(acceptedFiles);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
  });

  return (
    <Card
      {...getRootProps()}
      className={`relative h-64 w-full cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-gray-300 transition-all hover:border-gray-400 ${
        isDragActive ? "border-black bg-gray-50" : ""
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <Upload className="h-12 w-12 text-gray-400" />
        <div>
          <p className="text-lg font-medium text-gray-900">
            Drop your images here
          </p>
          <p className="mt-1 text-sm text-gray-500">
            or click to select files
          </p>
        </div>
      </div>
    </Card>
  );
};
