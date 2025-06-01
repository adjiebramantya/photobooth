"use client";
import React, { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";

export default function PhotoBooth(): React.JSX.Element {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const [capturedImages, setCapturedImages] = useState<string[]>([]);
	const [countdown, setCountdown] = useState<number | null>(null);
	const [showFlash, setShowFlash] = useState<boolean>(false);
	const [customColor, setCustomColor] = useState<string>("#FFFFFF");
	const [selectedTheme, setSelectedTheme] = useState<ThemeKey>("none");
	const [photoEmojis, setPhotoEmojis] = useState<
		Array<{ emoji: string; x: number; y: number }>
	>([]);
	const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
	const [photoToRetake, setPhotoToRetake] = useState<number | null>(null);
	const [isCapturing, setIsCapturing] = useState<boolean>(false);

	type ThemeKey = "none" | "love" | "party" | "nature" | "stars" | "music";

	const frontEmojis = [
		"😊",
		"❤️",
		"🌟",
		"🎉",
		"🌸",
		"✨",
		"🎵",
		"🎨",
		"🌈",
		"💫",
	];

	const emojis: Record<ThemeKey, string> = {
		none: "",
		love: "💕",
		party: "🎉",
		nature: "🌿",
		stars: "⭐",
		music: "🎵",
	};

	const defaultColors: Record<ThemeKey, string> = {
		none: "#FFFFFF",
		love: "#FFE6E6",
		party: "#F0F8FF",
		nature: "#F0FFF0",
		stars: "#F8F8FF",
		music: "#FFF0F5",
	};

	useEffect(() => {
		if (countdown === null) return;
		const timer = setTimeout(
			() => setCountdown((prev) => (prev !== null ? prev - 1 : null)),
			1000
		);
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

	useEffect(() => {
		if (selectedTheme !== "none") {
			setCustomColor(defaultColors[selectedTheme]);
		}
	}, [selectedTheme]);

	useEffect(() => {
		if (capturedImages.length === 0) {
			setPhotoEmojis([]);
		}
	}, [capturedImages.length]);

	const triggerFlash = () => {
		setShowFlash(true);
		setTimeout(() => setShowFlash(false), 200);
	};

	const takePhotos = async (
		isRetakeMode: boolean = false,
		retakeIndex: number | null = null
	) => {
		if (isCapturing) return;
		setIsCapturing(true);

		if (!isRetakeMode) {
			// Only clear photos when starting fresh
			setCapturedImages([]);
			setPhotoEmojis([]);
		}

		// Take one photo for retake, four photos for fresh start
		const photosToTake = isRetakeMode ? 1 : 4;

		for (let i = 0; i < photosToTake; i++) {
			setCountdown(3);
			await new Promise((resolve) => setTimeout(resolve, 3000));

			triggerFlash();
			const canvas = canvasRef.current;
			const video = videoRef.current;
			if (!canvas || !video) return;

			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
			const dataUrl = canvas.toDataURL("image/png");

			if (isRetakeMode && retakeIndex !== null) {
				// Replace only the selected photo
				setCapturedImages((prev) => {
					const newImages = [...prev];
					newImages[retakeIndex] = dataUrl;
					return newImages;
				});
			} else {
				// Add new photo when taking fresh photos
				setCapturedImages((prev) => [...prev, dataUrl]);
			}

			if (i < photosToTake - 1) {
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}
		}

		// Reset states after capturing is done
		setIsCapturing(false);
		setCountdown(null);
		if (isRetakeMode) {
			setPhotoToRetake(null);
			setShowConfirmDialog(false);
		}
	};

	const startRetake = (index: number) => {
		setPhotoToRetake(index);
		setShowConfirmDialog(true);
	};

	const startNewPhotoSession = () => {
		takePhotos(false, null);
	};

	const resetPhotos = () => {
		setCapturedImages([]);
		setCustomColor("#FFFFFF");
		setSelectedTheme("none");
		setPhotoEmojis([]);
		setPhotoToRetake(null);
		setShowConfirmDialog(false);
	};

	const downloadDivAsImage = () => {
		const divToCapture = document.getElementById("captureDiv");
		if (divToCapture) {
			html2canvas(divToCapture).then((canvas) => {
				const link = document.createElement("a");
				link.href = canvas.toDataURL("image/png");
				link.download = `photo_strip_${
					new Date().toISOString().split("T")[0]
				}.png`;
				link.click();
			});
		}
	};

	const addEmojiToPhoto = (emoji: string) => {
		setPhotoEmojis((prev) => [...prev, { emoji, x: 50, y: 50 }]);
	};

	const updateEmojiPosition = (index: number, x: number, y: number) => {
		setPhotoEmojis((prev) => {
			const newEmojis = [...prev];
			if (newEmojis[index]) {
				newEmojis[index] = { ...newEmojis[index], x, y };
			}
			return newEmojis;
		});
	};

	const removeEmoji = (index: number) => {
		setPhotoEmojis((prev) => prev.filter((_, i) => i !== index));
	};

	return (
		<div className='min-h-screen w-full relative bg-gradient-to-br from-[#F3E9DD] via-[#E7D5C9] to-[#DAC3B3]'>
			{/* Decorative pattern overlay */}
			<div
				className='absolute inset-0 opacity-5'
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
					backgroundSize: "30px 30px",
				}}
			/>
			<div className='flex flex-col items-center justify-center min-h-screen relative z-10'>
				{showConfirmDialog && (
					<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
						<div className='bg-white p-6 rounded-2xl shadow-lg max-w-sm w-full mx-4'>
							<h3 className='text-lg font-semibold text-gray-900 mb-4'>
								Retake Photo?
							</h3>
							<p className='text-gray-600 mb-6'>
								Are you sure you want to retake photo #
								{(photoToRetake || 0) + 1}? This action cannot be undone.
							</p>
							<div className='flex justify-end gap-3'>
								<button
									onClick={() => setShowConfirmDialog(false)}
									className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'>
									Cancel
								</button>
								<button
									onClick={() => {
										if (photoToRetake !== null) {
											setShowConfirmDialog(false);
											takePhotos(true, photoToRetake);
										}
									}}
									className='bg-[#BF9264] text-white px-4 py-2 rounded-full hover:bg-[#A67D4B] transition-all duration-300'>
									Retake Photo
								</button>
							</div>
						</div>
					</div>
				)}
				{showFlash && (
					<div className='absolute inset-0 bg-white opacity-80 animate-fadeOut pointer-events-none z-50'></div>
				)}
				<div className='bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl flex items-center justify-center'>
					<div>
						<div className='flex items-center justify-center mb-4'>
							<h1 className='text-3xl font-bold text-[#BF9264]'>
								BoopCam 🐾📸
							</h1>
						</div>
						<div className='relative'>
							{countdown !== null && (
								<div className=' absolute top-0 left-0 w-full h-full flex items-center justify-center'>
									<div className='bg-[#00000080] rounded-md px-4 py-2 text-2xl font-bold text-white'>
										{countdown}
									</div>
								</div>
							)}
							<video
								ref={videoRef}
								className='rounded-2xl shadow border-3 border-[#BF9264]'
								autoPlay
								muted></video>
						</div>
						<canvas ref={canvasRef} className='hidden' />

						<div className='flex justify-center mt-3 gap-2'>
							<button
								className='bg-white border border-[#BF9264] text-[#BF9264] px-4 py-2 rounded-full hover:bg-[#BF9264] hover:text-white transition-all duration-300'
								onClick={startNewPhotoSession}
								disabled={isCapturing}>
								{isCapturing
									? "Taking Photo..."
									: `Take Photo (${capturedImages.length}/4)`}
							</button>
							{capturedImages.length === 4 && (
								<>
									<button
										className='bg-white border border-[#BF9264] text-[#BF9264] px-4 py-2 rounded-full hover:bg-[#BF9264] hover:text-white transition-all duration-300'
										onClick={resetPhotos}>
										Reset
									</button>
									<button
										className='bg-white border border-[#BF9264] text-[#BF9264] px-4 py-2 rounded-full hover:bg-[#BF9264] hover:text-white transition-all duration-300'
										onClick={downloadDivAsImage}>
										Download Picture
									</button>
								</>
							)}
						</div>
						{capturedImages.length === 4 && (
							<div className='flex justify-center mt-3 items-center gap-4 flex-wrap'>
								<div className='flex flex-col gap-2'>
									<label className='block text-sm font-medium text-gray-700'>
										Add Emoji to Photos:
									</label>
									<div className='flex gap-2 flex-wrap max-w-[200px]'>
										{frontEmojis.map((emoji, index) => (
											<button
												key={index}
												onClick={() => addEmojiToPhoto(emoji)}
												className='p-2 text-xl hover:scale-125 transition-transform'>
												{emoji}
											</button>
										))}
									</div>
								</div>
								<div className='flex flex-col gap-2'>
									<label className='block text-sm font-medium text-gray-700'>
										Choose Emoji Pattern:
									</label>
									<div className='flex gap-2 items-center'>
										{Object.entries(emojis).map(([key, emoji]) => (
											<button
												key={key}
												onClick={() => {
													setSelectedTheme(key as ThemeKey);
												}}
												className={`p-2 rounded-md border ${
													selectedTheme === key
														? "border-[#BF9264] bg-[#BF9264] text-white"
														: "border-gray-300"
												}`}>
												{key === "none" ? "None" : emoji}
											</button>
										))}
									</div>
								</div>
								<div className='flex flex-col gap-2'>
									<label className='block text-sm font-medium text-gray-700'>
										Background Color:
									</label>
									<input
										type='color'
										value={customColor}
										onChange={(e) => {
											setCustomColor(e.target.value);
										}}
										className='w-full h-8 rounded cursor-pointer'
										title='Choose background color'
									/>
								</div>
							</div>
						)}
					</div>

					{capturedImages.length > 0 && (
						<div
							id='captureDiv'
							className='border border-[#BF9264] rounded-2xl px-4 pt-4 pb-[100px] m-4 relative overflow-hidden bg-white'
							style={{ backgroundColor: customColor }}>
							{selectedTheme !== "none" && (
								<div
									className='absolute inset-0 opacity-10 pointer-events-none'
									style={{
										backgroundImage: `${
											emojis[selectedTheme]
												? `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><text y='1em' font-size='20'>${emojis[selectedTheme]}</text></svg>")`
												: "none"
										}`,
										backgroundSize: "40px 40px",
										backgroundRepeat: "repeat",
									}}
								/>
							)}
							<div className='grid grid-cols-1 gap-4 relative z-10'>
								{capturedImages.map((img, index) => (
									<div
										key={index}
										className='flex flex-col items-center gap-2 relative group'>
										<div className='relative'>
											<img
												src={img}
												alt={`Captured ${index + 1}`}
												className='rounded-2xl shadow group-hover:opacity-90 transition-opacity'
												style={{ width: "200px", height: "auto" }}
											/>
											<div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
												<button
													onClick={() => startRetake(index)}
													className='bg-white/90 border border-[#BF9264] text-[#BF9264] px-4 py-2 rounded-full hover:bg-[#BF9264] hover:text-white transition-all duration-300 shadow-lg'>
													Retake #{index + 1}
												</button>
											</div>
										</div>
										{photoEmojis.map((emojiObj, emojiIndex) => (
											<div
												key={emojiIndex}
												className='absolute cursor-move text-2xl'
												style={{
													left: `${emojiObj.x}%`,
													top: `${emojiObj.y}%`,
													transform: "translate(-50%, -50%)",
													userSelect: "none",
												}}
												onMouseDown={(e) => {
													const startX = e.clientX;
													const startY = e.clientY;
													const startLeft = emojiObj.x;
													const startTop = emojiObj.y;

													const onMouseMove = (e: MouseEvent) => {
														const deltaX = e.clientX - startX;
														const deltaY = e.clientY - startY;
														const element = e.target as HTMLElement;
														const rect =
															element.parentElement?.getBoundingClientRect();

														if (rect) {
															const newX =
																startLeft + (deltaX / rect.width) * 100;
															const newY =
																startTop + (deltaY / rect.height) * 100;

															updateEmojiPosition(
																emojiIndex,
																Math.max(0, Math.min(100, newX)),
																Math.max(0, Math.min(100, newY))
															);
														}
													};

													const onMouseUp = () => {
														document.removeEventListener(
															"mousemove",
															onMouseMove
														);
														document.removeEventListener("mouseup", onMouseUp);
													};

													document.addEventListener("mousemove", onMouseMove);
													document.addEventListener("mouseup", onMouseUp);
												}}
												onDoubleClick={() => removeEmoji(emojiIndex)}>
												{emojiObj.emoji}
											</div>
										))}
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
