
import { useToast } from "@/hooks/use-toast";

const API_URL = "http://localhost:8000";

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
  
  try {
    const response = await fetch(`${API_URL}/api/process-images`, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error uploading images:", error);
    throw error;
  }
};

export const downloadProcessedImages = async (): Promise<string> => {
  try {
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
