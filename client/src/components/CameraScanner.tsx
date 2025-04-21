import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";

interface CameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (image: string) => void;
}

export default function CameraScanner({
  isOpen,
  onClose,
  onCapture,
}: CameraScannerProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);

  // Clean up camera when component unmounts
  useEffect(() => {
    return () => {
      if (webcamRef.current && webcamRef.current.video) {
        const videoTrack = (webcamRef.current.video as any).srcObject?.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.stop();
        }
      }
    };
  }, []);

  const handleCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
      }
    }
  };

  const toggleFlash = () => {
    setIsFlashOn(!isFlashOn);
    // In a real implementation, this would toggle the camera flash
    // Not all browsers/devices support this, so we're just toggling the state
  };

  if (!isOpen) return null;

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment",
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-40">
      <div className="relative h-full w-full">
        <div className="w-full h-full bg-slate-900 flex items-center justify-center">
          <div className="scanner-overlay absolute inset-0 pointer-events-none bg-gradient-to-b from-primary-600/20 to-primary-600/10"></div>
          <div className="scanner-target absolute w-56 h-56 border-2 border-primary rounded-lg"></div>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Camera UI Controls */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-slate-900/80 to-transparent p-4">
          <div className="flex justify-between items-center">
            <button 
              onClick={onClose}
              className="text-white p-2 rounded-full bg-slate-800/50"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
            <div className="text-white font-medium">Scan Question</div>
            <button 
              onClick={toggleFlash}
              className="text-white p-2 rounded-full bg-slate-800/50"
            >
              <i className={`${isFlashOn ? 'ri-flashlight-fill' : 'ri-flashlight-line'} text-xl`}></i>
            </button>
          </div>
        </div>
        
        {/* Bottom Camera Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900/80 to-transparent">
          <div className="flex justify-center items-center">
            <button 
              onClick={handleCapture}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center"
            >
              <div className="w-14 h-14 border-4 border-primary rounded-full"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
