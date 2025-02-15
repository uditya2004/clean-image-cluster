
import { Check, Loader2 } from "lucide-react";
import { Progress } from "./ui/progress";

interface Feature {
  id: string;
  label: string;
  status: "pending" | "processing" | "completed";
}

interface ProcessingStatusProps {
  features: Feature[];
  currentProgress: number;
}

export const ProcessingStatus = ({
  features,
  currentProgress,
}: ProcessingStatusProps) => {
  return (
    <div className="space-y-4">
      <Progress value={currentProgress} className="h-2" />
      <div className="space-y-2">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <span className="text-sm font-medium">{feature.label}</span>
            <div className="flex items-center gap-2">
              {feature.status === "completed" && (
                <Check className="h-4 w-4 text-green-500" />
              )}
              {feature.status === "processing" && (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              )}
              <span
                className={`text-sm ${
                  feature.status === "completed"
                    ? "text-green-500"
                    : feature.status === "processing"
                    ? "text-blue-500"
                    : "text-gray-400"
                }`}
              >
                {feature.status === "completed"
                  ? "Completed"
                  : feature.status === "processing"
                  ? "Processing..."
                  : "Pending"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
