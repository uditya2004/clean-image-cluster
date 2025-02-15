
import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { FeatureSelector } from "@/components/FeatureSelector";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";

const Index = () => {
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleUpload = (files: File[]) => {
    setUploadedImages(files);
    toast({
      title: "Images uploaded successfully",
      description: `${files.length} images have been uploaded.`,
    });
  };

  const handleFeatureToggle = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId)
        ? prev.filter((id) => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleProcess = async () => {
    if (uploadedImages.length === 0) {
      toast({
        title: "No images selected",
        description: "Please upload some images first.",
        variant: "destructive",
      });
      return;
    }

    if (selectedFeatures.length === 0) {
      toast({
        title: "No features selected",
        description: "Please select at least one feature to process.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    // TODO: Implement actual processing logic
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate processing
    setProcessing(false);

    toast({
      title: "Processing complete",
      description: "Your images have been processed successfully.",
    });
  };

  return (
    <div className="min-h-screen animate-fadeIn bg-white px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Image Cluster
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Upload your images and select the features you want to apply
          </p>
        </div>

        <ImageUpload onUpload={handleUpload} />

        {uploadedImages.length > 0 && (
          <div className="animate-slideUp space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {uploadedImages.length} images selected
              </p>
            </div>

            <FeatureSelector
              selectedFeatures={selectedFeatures}
              onFeatureToggle={handleFeatureToggle}
            />

            <div className="flex justify-center">
              <Button
                onClick={handleProcess}
                disabled={processing}
                className="group relative flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {processing ? "Processing..." : "Process and Download"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
