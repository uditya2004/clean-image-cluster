
import { useState } from "react";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Image, Ban, Eye, UserSearch } from "lucide-react";
import { Input } from "./ui/input";

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

  const handleFacePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFacePhoto(e.target.files[0]);
      onFeatureToggle("face");
    }
  };

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-medium">Select Features</h3>
      <div className="space-y-4">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="flex items-center justify-between space-x-4"
          >
            <div className="flex items-center space-x-3">
              {feature.icon}
              <Label htmlFor={feature.id} className="text-sm font-medium">
                {feature.label}
              </Label>
            </div>
            {feature.requiresPhoto ? (
              <div className="flex items-center gap-2">
                <Input
                  id={feature.id}
                  type="file"
                  accept="image/*"
                  className="w-40 text-sm"
                  onChange={handleFacePhotoChange}
                  onClick={(e) => {
                    // Reset the input value to allow selecting the same file again
                    (e.target as HTMLInputElement).value = '';
                  }}
                />
                {facePhoto && (
                  <img
                    src={URL.createObjectURL(facePhoto)}
                    alt="Reference face"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                )}
              </div>
            ) : (
              <Switch
                id={feature.id}
                checked={selectedFeatures.includes(feature.id)}
                onCheckedChange={() => onFeatureToggle(feature.id)}
              />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
