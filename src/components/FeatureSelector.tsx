
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Image, Ban, Eye } from "lucide-react";

interface Feature {
  id: string;
  label: string;
  icon: JSX.Element;
}

interface FeatureSelectorProps {
  selectedFeatures: string[];
  onFeatureToggle: (featureId: string) => void;
}

const features: Feature[] = [
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
            <Switch
              id={feature.id}
              checked={selectedFeatures.includes(feature.id)}
              onCheckedChange={() => onFeatureToggle(feature.id)}
            />
          </div>
        ))}
      </div>
    </Card>
  );
};
