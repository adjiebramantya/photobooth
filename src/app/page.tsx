"use client";
import React, { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";

export default function PhotoBooth(): React.JSX.Element {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const collageRef = useRef<HTMLCanvasElement | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [showFlash, setShowFlash] = useState<boolean>(false);
  const [backgroundColor, setBackgroundColor] = useState<string>("#FFFFFF");

  useEffect(() => {
    if (countdown === null) return;
      const timer = setTimeout(() => setCountdown((prev) => (prev !== null ? prev - 1 : null)), 1000);
      return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    const startCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    };
    startCamera();
  }, []);

  const triggerFlash = () => {
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 200);
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    setCapturedImages((prev) => [...prev, dataUrl]);
  };

  const takePhotos = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    setCapturedImages([]);

    for (let i = 0; i < 4; i++) {
      // Start countdown
      setCountdown(3);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      // Capture photo with flash
      triggerFlash();
      capturePhoto();
      
      // Wait a bit before next photo
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    setIsCapturing(false);
    setCountdown(null);
  };

  const resetPhotos = () => {
    setCapturedImages([]);
    setBackgroundColor("#FFFFFF");
  };

  const downloadDivAsImage = () => {
    const divToCapture = document.getElementById("captureDiv");
    if (divToCapture) {
      html2canvas(divToCapture).then((canvas) => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `photo_strip_${new Date().toISOString().split('T')[0]}.png`;
        link.click();
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {showFlash && (
        <div className="absolute inset-0 bg-white opacity-80 animate-fadeOut pointer-events-none z-50"></div>
      )}
      <div className="flex items-center justify-center">
        <div>
          <div className="relative">
            {countdown !== null && (
              <div className=" absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <div className="bg-[#00000080] rounded-md px-4 py-2 text-2xl font-bold text-white">
                  {countdown}
                </div>
              </div>
            )}
            <video ref={videoRef} className="rounded-2xl shadow border-3 border-[#BF9264]" autoPlay muted></video>
          </div>
          <canvas ref={canvasRef} className="hidden" />

          <div className="flex justify-center mt-3 gap-2">
            <button className="bg-white border border-[#BF9264] text-[#BF9264] px-4 py-2 rounded-full hover:bg-[#BF9264] hover:text-white transition-all duration-300" onClick={takePhotos} disabled={isCapturing}>
              Take Photo ({capturedImages.length}/4)
            </button>
            {capturedImages.length === 4 && (
              <>
                <button className="bg-white border border-[#BF9264] text-[#BF9264] px-4 py-2 rounded-full hover:bg-[#BF9264] hover:text-white transition-all duration-300" onClick={resetPhotos}>
                  Reset
                </button>
              </>
            )}
          </div>
          {capturedImages.length === 4 && (
            <div className="flex justify-center mt-3 items-center gap-2">
              <div>
                <label htmlFor="colorPicker" className="block text-sm font-medium text-gray-700">Choose Background Color:</label>
                <input
                  type="color"
                  id="colorPicker"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="mt-1 block w-full"
                />
              </div>
              <button
                className="bg-white border border-[#BF9264] text-[#BF9264] px-4 py-2 rounded-full hover:bg-[#BF9264] max-h-fit hover:text-white transition-all duration-300"
                onClick={downloadDivAsImage}
              >
                Download Picture
              </button>
            </div>
          )}
        </div>

        {capturedImages.length > 0 && (
          <div id="captureDiv" className="border border-[#BF9264] rounded-2xl px-4 pt-4 pb-[100px] m-4" style={{ backgroundColor }}>
            <div className="grid grid-cols-1 gap-4">
              {capturedImages.map((img, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <img
                    src={img}
                    alt={`Captured ${index + 1}`}
                    className="rounded-2xl shadow"
                    style={{ width: "200px", height: "auto" }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
