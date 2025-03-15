
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export const BackendStatus = () => {
  return (
    <Alert variant="default" className="bg-blue-50 border-blue-200">
      <InfoIcon className="h-4 w-4 text-blue-500" />
      <AlertTitle>Frontend-Only Mode</AlertTitle>
      <AlertDescription>
        This app is running in frontend-only mode. Some features that require backend processing (like blur detection) 
        will simulate results instead of performing actual image analysis.
      </AlertDescription>
    </Alert>
  );
};
