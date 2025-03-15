
import { useEffect, useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { checkBackendStatus } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";

export const BackendStatus = () => {
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  const [checkingBackend, setCheckingBackend] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkBackend = async () => {
      try {
        setCheckingBackend(true);
        const isAvailable = await checkBackendStatus();
        setBackendAvailable(isAvailable);
        
        if (!isAvailable) {
          toast({
            title: "Backend Connection Issue",
            description: "Unable to connect to the backend server. Make sure it's running on http://localhost:8000",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error checking backend:", error);
        setBackendAvailable(false);
      } finally {
        setCheckingBackend(false);
      }
    };
    
    checkBackend();
    
    // Set up an interval to check the backend status every 30 seconds
    const intervalId = setInterval(checkBackend, 30000);
    
    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [toast]);

  if (checkingBackend && backendAvailable === null) {
    return (
      <Alert variant="default" className="bg-gray-100">
        <AlertTitle>Checking backend connection...</AlertTitle>
        <AlertDescription>
          Verifying connection to the backend server at http://localhost:8000
        </AlertDescription>
      </Alert>
    );
  }

  if (backendAvailable === false) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Backend Connection Error</AlertTitle>
        <AlertDescription>
          Cannot connect to the backend server. Make sure it's running on http://localhost:8000
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
