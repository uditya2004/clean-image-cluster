
import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { FeatureSelector } from "@/components/FeatureSelector";
import { ProcessingStatus } from "@/components/ProcessingStatus";
import { ResultGallery } from "@/components/ResultGallery";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";

interface ProcessingFeature {
  id: string;
  label: string;
  status: "pending" | "processing" | "completed";
}

const features = [
  { id: "face", label: "Cluster by Face" },
  { id: "duplicates", label: "Remove Duplicates" },
  { id: "blur", label: "Remove Blur Images" },
  { id: "angles", label: "Remove Bad Angles" },
];

const Index = () => {
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [processingFeatures, setProcessingFeatures] = useState<ProcessingFeature[]>([]);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const handleUpload = (files: File[]) => {
    setUploadedImages(files);
    setIsComplete(false);
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

  const simulateProcessing = async () => {
    const selectedFeatureDetails = features
      .filter((f) => selectedFeatures.includes(f.id))
      .map((f) => ({ ...f, status: "pending" as const }));
    
    setProcessingFeatures(selectedFeatureDetails);
    
    for (let i = 0; i < selectedFeatureDetails.length; i++) {
      const feature = selectedFeatureDetails[i];
      
      // Update current feature to processing
      setProcessingFeatures((prev) =>
        prev.map((f) =>
          f.id === feature.id ? { ...f, status: "processing" } : f
        )
      );
      
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Update current feature to completed
      setProcessingFeatures((prev) =>
        prev.map((f) =>
          f.id === feature.id ? { ...f, status: "completed" } : f
        )
      );
      
      // Update progress
      setCurrentProgress(
        ((i + 1) / selectedFeatureDetails.length) * 100
      );
    }
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
    setCurrentProgress(0);
    setIsComplete(false);

    await simulateProcessing();

    setProcessing(false);
    setIsComplete(true);

    toast({
      title: "Processing complete",
      description: "Your images have been processed successfully.",
    });
  };

  const handleDownload = () => {
    toast({
      title: "Download started",
      description: "Your processed images are being prepared for download.",
    });
    // TODO: Implement actual ZIP download logic
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

        {uploadedImages.length > 0 && !processing && !isComplete && (
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
                Process Images
              </Button>
            </div>
          </div>
        )}

        {processing && (
          <div className="animate-slideUp">
            <ProcessingStatus
              features={processingFeatures}
              currentProgress={currentProgress}
            />
          </div>
        )}

        {isComplete && (
          <div className="animate-slideUp">
            <ResultGallery
              images={uploadedImages}
              onDownload={handleDownload}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
