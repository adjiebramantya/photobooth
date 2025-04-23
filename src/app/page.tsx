"use client";
import React, { useRef, useState, useEffect } from "react";

export default function PhotoBooth(): React.JSX.Element {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const collageRef = useRef<HTMLCanvasElement | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [showFlash, setShowFlash] = useState<boolean>(false);


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
  };

  const downloadCollage = () => {
    const canvas = collageRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 600;
    const height = 1600;
    const imgHeight = height / 4;
    canvas.width = width;
    canvas.height = height;

    const loadAndDraw = async () => {
      for (let i = 0; i < capturedImages.length; i++) {
        const img = new Image();
        img.src = capturedImages[i];
        await new Promise<void>((resolve) => {
          img.onload = () => {
            ctx.drawImage(img, 0, i * imgHeight, width, imgHeight);
            resolve();
          };
        });
      }
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "photo_strip.png";
      a.click();
    };

    loadAndDraw();
  };

  return (
    <div className="p-4 grid gap-4 relative">
      {showFlash && (
        <div className="absolute inset-0 bg-white opacity-80 animate-fadeOut pointer-events-none z-50"></div>
      )}
      <div className="flex">
        <div>
          <video ref={videoRef} className="rounded-2xl shadow" autoPlay muted></video>
          <canvas ref={canvasRef} className="hidden" />

            {countdown !== null && (
              <div className="text-6xl font-bold text-center">{countdown}</div>
            )}

            <div className="flex gap-2">
              <button onClick={takePhotos} disabled={isCapturing}>
                Take Photo ({capturedImages.length}/4)
              </button>
              <button onClick={resetPhotos} disabled={capturedImages.length === 0}>
                Reset
              </button>
              <button onClick={downloadCollage} disabled={capturedImages.length < 1}>Download All</button>
            </div>
        </div>

        {capturedImages.length > 0 && (
          <div>
            <div className="grid grid-cols-1 gap-4 p-4">
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
      <canvas ref={collageRef} className="hidden" />
    </div>
  );
}
