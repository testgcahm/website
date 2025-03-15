'use client';

import { useState } from "react";
import SaveImage from "@/components/SaveImage";
import SaveText from "@/components/SaveText";

export default function UploadPage() {
  const [activeComponent, setActiveComponent] = useState<"text" | "image">("text");

  return (
    <div className="p-6 max-w-lg mx-auto flex flex-col items-center text-center">
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setActiveComponent("text")}
          disabled={activeComponent === "text"}
          className={`px-4 py-2 rounded-lg shadow-md ${activeComponent === "text" ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
        >
          Show Text
        </button>
        <button
          onClick={() => setActiveComponent("image")}
          disabled={activeComponent === "image"}
          className={`px-4 py-2 rounded-lg shadow-md ${activeComponent === "image" ? "bg-gray-300 cursor-not-allowed" : "bg-green-500 text-white hover:bg-green-600"}`}
        >
          Show Image
        </button>
      </div>
      <div className="w-full flex justify-center">
        {activeComponent === "text" && <SaveText />}
        {activeComponent === "image" && <SaveImage />}
      </div>
    </div>
  );
}
