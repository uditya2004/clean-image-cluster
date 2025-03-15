
// This is a frontend-only implementation that simulates backend responses

// Simulate API responses without a backend
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
  try {
    console.log(`Simulating processing of ${files.length} files with features: ${features.join(', ')}`);
    
    // Create a short delay to simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate processing results
    const images = files.map(file => {
      // Randomly determine if an image is blurry (about 30% chance)
      const isBlurry = Math.random() < 0.3;
      // Generate a random blur score between 50 and 200
      const blurScore = isBlurry ? 
        Math.floor(Math.random() * 70) + 50 : 
        Math.floor(Math.random() * 80) + 120;
      
      return {
        filename: `simulated_${file.name}`,
        original_filename: file.name,
        blur_score: blurScore,
        is_blurry: isBlurry
      };
    });
    
    const blurryCount = images.filter(img => img.is_blurry).length;
    const sharpCount = images.length - blurryCount;
    
    const result = {
      total: images.length,
      sharp: sharpCount,
      blurry: blurryCount,
      images: images
    };
    
    console.log("Simulated processing results:", result);
    return result;
  } catch (error) {
    console.error("Error simulating image processing:", error);
    throw error;
  }
};

export const downloadProcessedImages = async (): Promise<string> => {
  try {
    console.log(`Simulating download of processed images`);
    
    // Create a delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Since we can't actually create a download without a backend,
    // we'll just show a message to the user via console
    console.log("In a real backend implementation, this would download the processed images");
    
    return "frontend-only-mode";
  } catch (error) {
    console.error("Error simulating download:", error);
    throw error;
  }
};

// Always return true since we're simulating the backend
export const checkBackendStatus = async (): Promise<boolean> => {
  // Simulate a short delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return true;
};
