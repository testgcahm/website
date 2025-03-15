"use client";

import { useState, useEffect } from "react";

const SaveText = () => {
    const [text, setText] = useState("");
    const [font, setFont] = useState("Arial");
    const [color, setColor] = useState("#000000");
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [fontSize, setFontSize] = useState(16);
    const [textAlign, setTextAlign] = useState<"left" | "right">("left"); // NEW: State for alignment
    const [loadingText, setLoadingText] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const fontOptions = ["Arial", "Times New Roman", "Courier New", "Verdana", "Georgia", "Comic Sans MS", "Noto Nastaliq Urdu"];

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleTextSave = async () => {
        if (!text.trim()) {
            setMessage({ text: "Please enter text before saving.", type: "error" });
            return;
        }

        setLoadingText(true);
        try {
            const response = await fetch("/api/saveText", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text,
                    font,
                    color,
                    style: `${isBold ? "bold" : ""} ${isItalic ? "italic" : ""}`.trim() || "normal",
                    fontSize,
                    textAlign // NEW: Save alignment
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to save text");

            setMessage({ text: data.message, type: "success" });

            // Reset states after successful save
            setText("");
            setFont("Arial");
            setColor("#000000");
            setIsBold(false);
            setIsItalic(false);
            setFontSize(16);
            setTextAlign("left"); // Reset alignment
        } catch (error) {
            setMessage({ text: "Failed to save text.", type: "error" });
            console.error(error);
        }
        setLoadingText(false);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-[#1f1f1f] text-2xl font-medium mb-8">Upload Page</h1>

            {message && (
                <div className={`mb-4 p-3 text-white rounded-md ${message.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-[0_1px_3px_0_rgba(0,0,0,0.12)]">
                <div className="flex gap-4 p-3 border-b border-[#dadce0] flex-wrap">
                    <select
                        className="h-9 px-3 bg-white border border-[#dadce0] rounded-md text-sm text-[#1f1f1f] 
                                  hover:bg-[#f8f9fa] focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] outline-none transition-all"
                        value={font}
                        onChange={(e) => setFont(e.target.value)}
                    >
                        {fontOptions.map((fnt) => (
                            <option key={fnt} value={fnt} style={{ fontFamily: fnt }}>{fnt}</option>
                        ))}
                    </select>

                    <div className="flex items-center space-x-1 border-r border-[#dadce0] pr-4">
                        <button
                            className={`w-7 h-7 rounded-md flex items-center justify-center hover:bg-[#f1f3f4] 
                                    ${isBold ? "bg-[#e8f0fe] text-[#1967d2]" : "text-[#1f1f1f]"}`}
                            onClick={() => setIsBold(!isBold)}
                        >
                            <span className="font-bold">B</span>
                        </button>
                        <button
                            className={`w-7 h-7 rounded-md flex items-center justify-center hover:bg-[#f1f3f4] 
                                    ${isItalic ? "bg-[#e8f0fe] text-[#1967d2]" : "text-[#1f1f1f]"}`}
                            onClick={() => setIsItalic(!isItalic)}
                        >
                            <span className="italic">I</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-1 border-r border-[#dadce0] pr-4">
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="hidden"
                            id="colorPicker"
                        />
                        <label
                            htmlFor="colorPicker"
                            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-[#f1f3f4] cursor-pointer relative"
                            title="Text color"
                        >
                            <div className="w-5 h-5 rounded-full border border-[#dadce0]"
                                style={{ backgroundColor: color }} />
                            <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border border-white bg-[#5f6368]" />
                        </label>
                    </div>

                    <div className="flex items-center gap-1 border-r border-[#dadce0] pr-4">
                        <button
                            className={`w-7 h-7 rounded-md flex items-center justify-center hover:bg-[#f1f3f4] 
                                    ${textAlign === "right" ? "bg-[#e8f0fe] text-[#1967d2]" : "text-[#1f1f1f]"}`}
                            onClick={() => setTextAlign(textAlign === "left" ? "right" : "left")}
                        >
                            <span>{textAlign === "left" ? "➡️" : "⬅️"}</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-[#f1f3f4] text-[#1f1f1f]"
                            onClick={() => setFontSize(Math.max(10, fontSize - 1))}
                        >
                            <span className="text-lg">-</span>
                        </button>
                        <input
                            type="number"
                            value={fontSize}
                            onChange={(e) => setFontSize(Math.max(10, parseInt(e.target.value) || 10))}
                            className="w-12 h-8 text-center border border-[#dadce0] rounded-md text-sm outline-none focus:border-[#1a73e8]"
                        />
                        <button
                            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-[#f1f3f4] text-[#1f1f1f]"
                            onClick={() => setFontSize(fontSize + 1)}
                        >
                            <span className="text-lg">+</span>
                        </button>
                    </div>
                </div>

                <textarea
                    className="w-full min-h-[200px] p-8 text-[#1f1f1f] text-[14px] leading-[1.5] font-sans 
                              outline-none resize-none placeholder:text-[#80868b]"
                    placeholder="Start typing..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    style={{
                        fontFamily: font,
                        fontWeight: isBold ? "bold" : "normal",
                        fontStyle: isItalic ? "italic" : "normal",
                        color,
                        fontSize: `${fontSize}px`,
                        textAlign: textAlign, // APPLY TEXT ALIGNMENT
                        direction: textAlign === "right" ? "rtl" : "ltr", // HANDLE RTL/LTR
                    }}
                />
            </div>

            <div className="mt-6 flex justify-center">
                <button
                    className="px-6 py-2 rounded-md bg-[#1a73e8] text-white hover:bg-[#1557b0] 
                              disabled:bg-[#9aa0a6] disabled:cursor-not-allowed transition-colors"
                    onClick={handleTextSave}
                    disabled={loadingText || !text.trim()}
                >
                    {loadingText ? "Saving..." : "Save Text"}
                </button>
            </div>
        </div>
    );
};

export default SaveText;
