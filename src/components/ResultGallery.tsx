
import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Download, Loader2 } from "lucide-react";

interface ResultGalleryProps {
  images: File[];
  onDownload: () => void;
}

export const ResultGallery = ({ images, onDownload }: ResultGalleryProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    await onDownload();
    // Simulate download process
    setTimeout(() => {
      setIsDownloading(false);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {images.map((image, index) => (
          <Card key={index} className="overflow-hidden">
            <img
              src={URL.createObjectURL(image)}
              alt={`Processed ${index + 1}`}
              className="aspect-square h-full w-full object-cover"
            />
          </Card>
        ))}
      </div>
      <div className="flex justify-center pt-4">
        <Button 
          onClick={handleDownload} 
          disabled={isDownloading}
          className="flex items-center gap-2"
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isDownloading ? "Downloading..." : "Download ZIP"}
        </Button>
      </div>
    </div>
  );
};
