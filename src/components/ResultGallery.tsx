
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Download } from "lucide-react";

interface ResultGalleryProps {
  images: File[];
  onDownload: () => void;
}

export const ResultGallery = ({ images, onDownload }: ResultGalleryProps) => {
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
        <Button onClick={onDownload} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download ZIP
        </Button>
      </div>
    </div>
  );
};
