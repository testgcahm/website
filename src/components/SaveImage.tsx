"use client";

import { useState, useEffect } from "react";

const SaveImage = () => {
    const [loadingImage, setLoadingImage] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;

        if (selectedFile) {
            const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
            if (!validImageTypes.includes(selectedFile.type)) {
                setMessage({ text: "Only JPG, PNG, GIF, and WEBP images are allowed.", type: "error" });
                setFile(null);
                return;
            }
        }

        setFile(selectedFile);
    };

    const handleFileUpload = async () => {
        if (!file) {
            setMessage({ text: "Please select an image file.", type: "error" });
            return;
        }

        setLoadingImage(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append("file", file);

        const xhr = new XMLHttpRequest();

        xhr.open("POST", "/api/saveImage", true);

        // Track upload progress
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const progress = Math.round((event.loaded / event.total) * 100);
                setUploadProgress(progress);
            }
        };

        xhr.onload = () => {
            setLoadingImage(false);
            setUploadProgress(0);

            if (xhr.status === 200) {
                setMessage({ text: "Image uploaded successfully!", type: "success" });
                setFile(null); // Clear file after successful upload
            } else {
                setMessage({ text: "Upload failed: " + xhr.responseText, type: "error" });
            }
        };

        xhr.onerror = () => {
            setLoadingImage(false);
            setUploadProgress(0);
            setMessage({ text: "Upload error. Please try again.", type: "error" });
        };

        xhr.send(formData);
    };

    // Automatically clear message after 5 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <div className="mt-6 flex flex-col items-center">
            {/* Message Display */}
            {message && (
                <p className={`mb-3 text-sm text-center ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
                    {message.text}
                </p>
            )}

            {/* File Selection Button */}
            <label className="block bg-gray-100 max-w-[200px] text-gray-600 px-4 py-2 rounded-lg text-center cursor-pointer hover:bg-gray-200 transition">
                Choose Image
                <input
                    type="file"
                    className="hidden"
                    accept="image/*" // Accept only images
                    onChange={handleFileChange}
                />
            </label>

            {/* Display selected file name */}
            {file && <p className="mt-2 text-sm text-gray-700 text-center">{file.name}</p>}

            {/* Upload Button */}
            <button
                className="mt-3 w-full px-4 py-2 rounded-lg text-white bg-green-500 hover:bg-green-600 active:bg-green-700 transition-all cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={handleFileUpload}
                disabled={loadingImage || !file}
            >
                {loadingImage ? "Uploading..." : "Upload Image"}
            </button>

            {/* Progress Bar */}
            {uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-lg mt-3">
                    <div
                        className="bg-blue-500 text-xs leading-none py-1 text-center text-white rounded-lg"
                        style={{ width: `${uploadProgress}%` }}
                    >
                        {uploadProgress}%
                    </div>
                </div>
            )}
        </div>
    );
};

export default SaveImage;
