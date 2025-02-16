
import { useState, useRef } from "react";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Image, Ban, Eye, UserSearch, Camera, Upload } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface Feature {
  id: string;
  label: string;
  icon: JSX.Element;
  requiresPhoto?: boolean;
}

interface FeatureSelectorProps {
  selectedFeatures: string[];
  onFeatureToggle: (featureId: string) => void;
}

const features: Feature[] = [
  {
    id: "face",
    label: "Cluster by Face",
    icon: <UserSearch className="h-5 w-5" />,
    requiresPhoto: true,
  },
  {
    id: "duplicates",
    label: "Remove Duplicates",
    icon: <Ban className="h-5 w-5" />,
  },
  {
    id: "blur",
    label: "Remove Blur Images",
    icon: <Image className="h-5 w-5" />,
  },
  {
    id: "angles",
    label: "Remove Bad Angles",
    icon: <Eye className="h-5 w-5" />,
  },
];

export const FeatureSelector = ({
  selectedFeatures,
  onFeatureToggle,
}: FeatureSelectorProps) => {
  const [facePhoto, setFacePhoto] = useState<File | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleFacePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFacePhoto(e.target.files[0]);
    }
  };

  const startCamera = async () => {
    try {
      setShowCamera(true); // First show the dialog
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setShowCamera(false); // Hide dialog on error
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "captured-face.jpg", { type: "image/jpeg" });
            setFacePhoto(file);
            stopCamera();

            toast({
              title: "Photo captured",
              description: "Reference photo has been captured successfully.",
            });
          }
        }, 'image/jpeg');
      }
    }
  };

  return (
    <>
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-medium">Select Features</h3>
        <div className="space-y-4">
          {features.map((feature) => (
            <div key={feature.id} className="space-y-2">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-3">
                  {feature.icon}
                  <Label htmlFor={feature.id} className="text-sm font-medium">
                    {feature.label}
                  </Label>
                </div>
                <Switch
                  id={feature.id}
                  checked={selectedFeatures.includes(feature.id)}
                  onCheckedChange={() => onFeatureToggle(feature.id)}
                />
              </div>
              {feature.requiresPhoto && selectedFeatures.includes(feature.id) && (
                <div className="ml-8 mt-2 space-y-3 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        className="w-full text-sm"
                        onChange={handleFacePhotoChange}
                        onClick={(e) => {
                          (e.target as HTMLInputElement).value = '';
                        }}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={startCamera}
                    >
                      <Camera className="h-4 w-4" />
                      Capture
                    </Button>
                  </div>

                  {facePhoto && (
                    <div className="flex items-center gap-2">
                      <img
                        src={URL.createObjectURL(facePhoto)}
                        alt="Reference face"
                        className="h-12 w-12 rounded-full object-cover shrink-0"
                      />
                      <span className="text-sm text-gray-500">
                        Reference photo selected
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={showCamera} onOpenChange={(open) => {
        if (!open) stopCamera();
        setShowCamera(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Take a Photo</DialogTitle>
          </DialogHeader>
          <div className="relative rounded-lg border overflow-hidden bg-muted">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full"
            />
            <Button
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
              onClick={capturePhoto}
            >
              Take Photo
            </Button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </DialogContent>
      </Dialog>
    </>
  );
};
