
import { useToast } from "@/hooks/use-toast";

// Use a configurable API URL to allow different environments
// Default to the FastAPI server running locally
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const uploadImages = async (
  files: File[],
  features: string[]
): Promise<{ 
  total: number;
  sharp: number;
  blurry: number;
  images: {
    filename: string;
    original_filename: string;
    blur_score: number;
    is_blurry: boolean;
  }[]
}> => {
  const formData = new FormData();
  
  files.forEach((file) => {
    formData.append("files", file);
  });
  
  // Add features to the request
  features.forEach(feature => {
    formData.append("features", feature);
  });
  
  try {
    console.log(`Sending request to ${API_URL}/api/process-images with ${files.length} files`);
    
    const response = await fetch(`${API_URL}/api/process-images`, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server error: ${response.status}`, errorText);
      throw new Error(`HTTP error! status: ${response.status}. ${errorText}`);
    }
    
    const data = await response.json();
    console.log("API response:", data);
    return data;
  } catch (error) {
    console.error("Error uploading images:", error);
    throw error;
  }
};

export const downloadProcessedImages = async (): Promise<string> => {
  try {
    console.log(`Requesting download from ${API_URL}/api/download`);
    
    // Get the URL for the download
    const downloadUrl = `${API_URL}/api/download`;
    
    // Open the download URL in a new tab
    window.open(downloadUrl, '_blank');
    
    return downloadUrl;
  } catch (error) {
    console.error("Error downloading images:", error);
    throw error;
  }
};

// Helper function to check if backend is available
export const checkBackendStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      // Set a timeout to avoid long waits
      signal: AbortSignal.timeout(3000),
    });
    
    return response.ok;
  } catch (error) {
    console.warn("Backend check failed:", error);
    return false;
  }
};
