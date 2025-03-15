
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProcessButtonProps {
  onProcess: () => void;
  disabled: boolean;
  processing: boolean;
  uploadedImagesCount: number;
  selectedFeaturesCount: number;
}

export const ProcessButton = ({
  onProcess,
  disabled,
  processing,
  uploadedImagesCount,
  selectedFeaturesCount,
}: ProcessButtonProps) => {
  const { toast } = useToast();

  const handleClick = () => {
    if (uploadedImagesCount === 0) {
      toast({
        title: "No images selected",
        description: "Please upload some images first.",
        variant: "destructive",
      });
      return;
    }

    if (selectedFeaturesCount === 0) {
      toast({
        title: "No features selected",
        description: "Please select at least one feature to process.",
        variant: "destructive",
      });
      return;
    }

    onProcess();
  };

  return (
    <div className="flex justify-center">
      <Button
        onClick={handleClick}
        disabled={disabled || processing}
        className="group relative flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Process Images
      </Button>
    </div>
  );
};
