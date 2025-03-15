"use client";

import { useState, useEffect } from "react";

const SaveImage = () => {
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
    const [showAll, setShowAll] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        const filteredFiles = selectedFiles.filter(file => validImageTypes.includes(file.type));

        if (filteredFiles.length !== selectedFiles.length) {
            setMessage({ text: "Only JPG, PNG, GIF, and WEBP images are allowed.", type: "error" });
        }

        setFiles(prevFiles => [...prevFiles, ...filteredFiles]);
    };

    const handleFileUpload = async () => {
        if (files.length === 0) {
            setMessage({ text: "Please select images to upload.", type: "error" });
            return;
        }

        setLoading(true);
        const newProgress: { [key: string]: number } = {};
        files.forEach(file => (newProgress[file.name] = 0));
        setUploadProgress(newProgress);

        const uploadPromises = files.map(file => {
            return new Promise<void>((resolve, reject) => {
                const formData = new FormData();
                formData.append("file", file);

                const xhr = new XMLHttpRequest();
                xhr.open("POST", "/api/saveImage", true);

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const progress = Math.round((event.loaded / event.total) * 100);
                        setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
                    }
                };

                xhr.onload = () => {
                    if (xhr.status === 200) {
                        resolve();
                    } else {
                        reject(new Error("Upload failed: " + xhr.responseText));
                    }
                };

                xhr.onerror = () => reject(new Error("Upload error. Please try again."));

                xhr.send(formData);
            });
        });

        try {
            await Promise.all(uploadPromises);
            setMessage({ text: "Images uploaded successfully!", type: "success" });
            setFiles([]);
        } catch (error) {
            setMessage({ text: (error as Error).message, type: "error" });
        }

        setLoading(false);
    };

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <div className="mt-6 flex flex-col items-center">
            {message && (
                <p className={`mb-3 text-sm text-center ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
                    {message.text}
                </p>
            )}

            <label className="block bg-gray-100 max-w-[200px] text-gray-600 px-4 py-2 rounded-lg text-center cursor-pointer hover:bg-gray-200 transition">
                Choose Images
                <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                />
            </label>

            {files.length > 0 && (
                <div className="mt-3 w-full max-w-md">
                    {(showAll ? files : files.slice(0, 5)).map(file => (
                        <p key={file.name} className="text-sm text-gray-700 text-center truncate">
                            {file.name} ({uploadProgress[file.name] || 0}%)
                        </p>
                    ))}
                    {files.length > 5 && (
                        <button
                            className="text-blue-500 text-sm mt-2 hover:underline"
                            onClick={() => setShowAll(!showAll)}
                        >
                            {showAll ? "Show Less" : `Show All (${files.length})`}
                        </button>
                    )}
                </div>
            )}

            <button
                className="mt-4 px-4 py-2 rounded-lg text-white bg-green-500 hover:bg-green-600 active:bg-green-700 transition-all cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={handleFileUpload}
                disabled={loading || files.length === 0}
            >
                {loading ? "Uploading..." : "Upload All Images"}
            </button>

            {Object.keys(uploadProgress).length > 0 && (
                <div className="w-full bg-gray-200 rounded-lg mt-3 max-w-md">
                    {(showAll ? files : files.slice(0, 5)).map(file => (
                        <div key={file.name} className="mb-2">
                            <div
                                className="bg-blue-500 text-xs leading-none py-1 text-center text-white rounded-lg"
                                style={{ width: `${uploadProgress[file.name]}%` }}
                            >
                                {uploadProgress[file.name]}%
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SaveImage;
