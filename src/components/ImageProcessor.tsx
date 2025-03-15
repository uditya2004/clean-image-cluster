
import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { FeatureSelector } from "@/components/FeatureSelector";
import { ProcessingStatus } from "@/components/ProcessingStatus";
import { ResultGallery } from "@/components/ResultGallery";
import { ProcessButton } from "@/components/ProcessButton";
import { useToast } from "@/hooks/use-toast";
import { uploadImages, downloadProcessedImages } from "@/services/apiService";

export interface ProcessingFeature {
  id: string;
  label: string;
  status: "pending" | "processing" | "completed";
}

export interface ProcessedImage {
  filename: string;
  original_filename: string;
  blur_score: number;
  is_blurry: boolean;
}

const features = [
  { id: "face", label: "Cluster by Face" },
  { id: "duplicates", label: "Remove Duplicates" },
  { id: "blur", label: "Remove Blur Images" },
  { id: "angles", label: "Remove Bad Angles" },
];

export const ImageProcessor = () => {
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [processingFeatures, setProcessingFeatures] = useState<ProcessingFeature[]>([]);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<File[]>([]);
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
      
      if (feature.id === "blur") {
        try {
          // Call the FastAPI backend to process images
          const result = await uploadImages(uploadedImages, selectedFeatures);
          
          // Save the processed images to state
          setProcessedImages(result.images);
          
          // Filter the original images based on which ones were kept
          const keptFiles = uploadedImages.filter(file => {
            const matchingResult = result.images.find(img => 
              img.original_filename === file.name && !img.is_blurry
            );
            return !!matchingResult;
          });
          
          setFilteredImages(keptFiles);
          
          // Show summary in toast
          toast({
            title: "Blur Detection Complete",
            description: `Kept ${result.sharp} sharp images, removed ${result.blurry} blurry images`,
          });
          
        } catch (error) {
          console.error("Error processing blur images:", error);
          toast({
            title: "Processing Error",
            description: "There was an error processing your images. Please check if the backend server is running.",
            variant: "destructive",
          });
        }
      } else {
        // Simulate processing delay for other features (to be implemented later)
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      
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

  const handleDownload = async () => {
    toast({
      title: "Download started",
      description: "Your processed images are being prepared for download.",
    });
    
    // If the blur removal feature was selected, use the API to download
    if (selectedFeatures.includes("blur")) {
      try {
        await downloadProcessedImages();
      } catch (error) {
        console.error("Error downloading images:", error);
        toast({
          title: "Download Error",
          description: "There was an error downloading your images.",
          variant: "destructive",
        });
      }
    } else {
      // Implement other feature download logic when they're added
      // For now, this is just a placeholder
      setTimeout(() => {
        toast({
          title: "Download complete",
          description: "Your processed images have been downloaded.",
        });
      }, 2000);
    }
  };

  return (
    <div className="space-y-8">
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

          <ProcessButton 
            onProcess={handleProcess}
            disabled={false}
            processing={processing}
            uploadedImagesCount={uploadedImages.length}
            selectedFeaturesCount={selectedFeatures.length}
          />
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
            images={selectedFeatures.includes("blur") ? filteredImages : uploadedImages}
            onDownload={handleDownload}
          />
        </div>
      )}
    </div>
  );
};
