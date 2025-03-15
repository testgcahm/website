"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useGesture } from "@use-gesture/react";

interface TextData {
  text: string;
  font: string;
  color: string;
  style: string;
  fontSize: number;
}

export default function DisplayPage() {
  const [textEntries, setTextEntries] = useState<TextData[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const fetchText = async () => {
      try {
        const response = await fetch("/text/text.json");
        if (!response.ok) throw new Error("Failed to load text");
        const data: TextData[] = await response.json();
        setTextEntries(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching text:", error);
      }
    };

    const fetchImages = async () => {
      try {
        const response = await fetch("/api/listImages");
        if (!response.ok) throw new Error("Failed to load images");
        const data = await response.json();
        setImages(data.images);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchText();
    fetchImages();
  }, []);

  // Close modal on ESC key press
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") setSelectedImage(null);
  }, []);

  useEffect(() => {
    if (selectedImage) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open
    } else {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto"; // Restore scrolling
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [selectedImage, handleKeyDown]);

  // Gesture controls (swipe to close, prevent accidental closing on PC)
  const bind = useGesture({
    onDrag: () => setIsDragging(true),
    onDragEnd: ({ movement: [mx, my], intentional }) => {
      setIsDragging(false);
      if (intentional && (Math.abs(mx) > 100 || Math.abs(my) > 100)) {
        setSelectedImage(null);
      }
    },
  });

  // Handle mouse clicks: Close only if not dragging
  const handleMouseClick = () => {
    if (!isDragging) {
      setSelectedImage(null);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-center">Display Page</h1>

      {/* Display multiple text entries */}
      {textEntries.length > 0 ? (
        <div className="space-y-4 mt-4">
          {textEntries.map((entry, index) => (
            <div
              key={index}
              className="p-4 rounded-lg shadow-md border"
              style={{
                fontFamily: entry.font,
                color: entry.color,
                fontStyle: entry.style.includes("italic") ? "italic" : "normal",
                fontWeight: entry.style.includes("bold") ? "bold" : "normal",
                fontSize: entry.fontSize,
              }}
            >
              {entry.text}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-4">No text available</p>
      )}

      {/* Display images with lightbox effect */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        {images.length > 0 ? (
          images.map((img, index) => (
            <div
              key={index}
              className="relative w-full h-40 cursor-pointer"
              onClick={() => setSelectedImage(img)}
            >
              <Image
                src={img}
                alt="Uploaded"
                width={200}
                height={200}
                className="rounded-lg shadow-md object-cover"
                onError={() => console.error("Image failed to load:", img)}
              />
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center">No images available</p>
        )}
      </div>

      {/* Full-screen modal for image */}
      {/* Full-screen modal for image */}
      {selectedImage && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50"
          {...bind()}
          onClick={handleMouseClick}
        >
          <div className="relative w-screen h-screen flex justify-center items-center">
            <div className="relative w-[90vw] h-[90vh]">
              <Image
                src={selectedImage}
                alt="Enlarged"
                fill
                style={{ objectFit: "contain" }} // Ensures full image is visible without cropping
                className="rounded-lg shadow-lg"
              />
            </div>

            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-white cursor-pointer bg-gray-900 rounded-full p-2 px-[14px] text-xl font-bold"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
