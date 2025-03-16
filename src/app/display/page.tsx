"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useGesture } from "@use-gesture/react";
import parse from "html-react-parser";
import dayjs from "dayjs";

interface TextData {
  content: string;
  timestamp: string;
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

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") setSelectedImage(null);
  }, []);

  useEffect(() => {
    if (selectedImage) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [selectedImage, handleKeyDown]);

  const bind = useGesture({
    onDrag: () => setIsDragging(true),
    onDragEnd: ({ movement: [mx, my], intentional }) => {
      setIsDragging(false);
      if (intentional && (Math.abs(mx) > 100 || Math.abs(my) > 100)) {
        setSelectedImage(null);
      }
    },
  });

  const handleMouseClick = () => {
    if (!isDragging) {
      setSelectedImage(null);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-center">Display Page</h1>

      {/* Text Entries Section */}
      {textEntries.length > 0 ? (
        <div className="space-y-4 mt-4">
          {textEntries.map((entry, index) => (
            <div key={index} className="p-4 rounded-lg shadow-md border-gray-300 border">
              <div>{parse(entry.content)}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-4">No text available</p>
      )}

      {/* Images Grid */}
      <div className="grid max-csm:grid-cols-1 grid-cols-2 cmd:grid-cols-3 cmd:gap-x-[220px] mx-2 gap-6 mt-6 place-items-center">
        {images.length > 0 ? (
          images.map((img, index) => (
            <div
              key={index}
              className="relative cursor-pointer overflow-hidden rounded-lg shadow-md bg-gray-100 flex items-center justify-center cxs:max-csm:w-[300px] cxs:max-csm:h-[300px] w-[250px] h-[200px]"
              onClick={() => setSelectedImage(img)}
            >
              <Image
                src={img}
                alt="Uploaded"
                width={250}
                height={200}
                className="object-contain w-full h-full transition-transform hover:scale-105"
                loading="lazy"
                onError={() => console.error("Image failed to load:", img)}
              />
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center">No images available</p>
        )}
      </div>

      {/* Fullscreen Image Viewer */}
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
                style={{ objectFit: "contain" }}
                className="rounded-lg shadow-lg"
              />
            </div>

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
