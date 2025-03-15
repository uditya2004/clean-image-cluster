
import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Download, Loader2, ImageOff } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface ResultGalleryProps {
  images: File[];
  onDownload: () => void;
}

export const ResultGallery = ({ images, onDownload }: ResultGalleryProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    await onDownload();
    // Set a timeout to reset the downloading state
    setTimeout(() => {
      setIsDownloading(false);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Processed Results</h3>
        <p className="text-sm text-gray-500">{images.length} images kept</p>
      </div>
      
      {images.length > 0 ? (
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
      ) : (
        <Alert>
          <ImageOff className="h-4 w-4 mr-2" />
          <AlertDescription>
            No sharp images were found in your selection. All images were classified as blurry.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-center pt-4">
        <Button 
          onClick={handleDownload} 
          disabled={isDownloading || images.length === 0}
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
