"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react"; // Import Trash Icon

interface TextData {
  text: string;
  font: string;
  color: string;
  style: string;
  fontSize: number;
}

export default function DeletePage() {
  const [textEntries, setTextEntries] = useState<TextData[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchText();
    fetchImages();
  }, []);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 5000); // Hide after 5 seconds
  };

  const fetchText = async () => {
    try {
      const response = await fetch("/text/text.json"); // Ensure correct path
      if (!response.ok) throw new Error("Text not found");
      const data: TextData[] = await response.json();
      if (Array.isArray(data)) {
        setTextEntries(data);
      } else {
        console.warn("Unexpected text format, resetting to array.");
        setTextEntries([]);
      }
    } catch (error) {
      console.error("Error fetching text:", error);
      setTextEntries([]);
    }
  };

  const fetchImages = async () => {
    try {
      const response = await fetch("/api/listImages");
      if (!response.ok) throw new Error("Failed to fetch images");
      const data = await response.json();
      setImages(Array.isArray(data.images) ? data.images : []);
    } catch (error) {
      console.error("Error fetching images:", error);
      setImages([]);
    }
  };

  const handleDeleteText = async (index: number) => {
    setLoading(true);
    try {
      const response = await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "text", index }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete text");

      setTextEntries((prev) => prev.filter((_, i) => i !== index));
      showMessage("Text deleted successfully!");
    } catch (error) {
      showMessage("Failed to delete text.");
      console.error(error);
    }
    setLoading(false);
  };

  const handleDeleteImage = async (filename: string) => {
    setLoading(true);

    try {
      const response = await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "image", filename }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete image");

      // Wait a short moment before fetching again to ensure file deletion is complete
      setTimeout(() => {
        fetchImages(); // Refresh image list after deletion
      }, 500);

      showMessage("Image deleted successfully!");
    } catch (error) {
      showMessage("Failed to delete image.");
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-center">Delete Page</h1>

      {/* Temporary Message Display */}
      {message && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md text-center my-4 transition-opacity duration-500">
          {message}
        </div>
      )}

      {/* Delete Text Section */}
      {textEntries.length > 0 ? (
        <div className="space-y-4 mt-4">
          {textEntries.map((entry, index) => (
            <div
              key={index}
              className="border border-gray-300 p-4 rounded flex justify-between items-center"
              style={{
                fontFamily: entry.font,
                color: entry.color,
                fontStyle: entry.style.includes("italic") ? "italic" : "normal",
                fontWeight: entry.style.includes("bold") ? "bold" : "normal",
                fontSize: entry.fontSize,
              }}
            >
              <p>{entry.text}</p>
              <Trash2
                className="text-red-500 cursor-pointer hover:scale-110 transition-transform mx-3"
                size={30}
                onClick={() => handleDeleteText(index)}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-4">No text available</p>
      )}

      {/* Delete Images Section */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {images.map((img, index) => (
            <div key={index} className="relative">
              <img src={img} alt="Uploaded" className="rounded-lg shadow-md w-full h-40 object-cover" />
              <Trash2
                className="absolute top-2 right-2 text-red-500 cursor-pointer hover:scale-110 transition-transform mx-3"
                size={30}
                onClick={() => handleDeleteImage(img.split("/").pop() || "")}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 col-span-full text-center mt-4">No images available</p>
      )}
    </div>
  );
}
