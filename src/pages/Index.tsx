
import { BackendStatus } from "@/components/BackendStatus";
import { ImageProcessor } from "@/components/ImageProcessor";

const Index = () => {
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

        <BackendStatus />
        <ImageProcessor />
      </div>
    </div>
  );
};

export default Index;
