"use client";

import { useState, useRef, useEffect } from "react";

const SaveText = () => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [font, setFont] = useState("Arial");
    const [color, setColor] = useState("#000000");
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [fontSize, setFontSize] = useState(16);
    const [textAlign, setTextAlign] = useState<"left" | "right">("left");
    const [loadingText, setLoadingText] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const fontOptions = [
        "Arial",
        "Times New Roman",
        "Courier New",
        "Verdana",
        "Georgia",
        "Comic Sans MS",
        "Noto Nastaliq Urdu",
    ];

    // Helper: Convert an RGB color string to hex (if needed)
    const convertColor = (colorStr: string): string => {
        if (colorStr.startsWith("#")) return colorStr;
        const rgb = colorStr.match(/\d+/g);
        if (rgb && rgb.length >= 3) {
            return (
                "#" +
                rgb
                    .slice(0, 3)
                    .map((x) => parseInt(x).toString(16).padStart(2, "0"))
                    .join("")
            );
        }
        return colorStr;
    };

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        const handleSelectionChange = () => {
            // Only update when our editor is focused
            if (document.activeElement === editorRef.current) {
                updateButtonStates();
            }
        };
        document.addEventListener("selectionchange", handleSelectionChange);
        return () => {
            document.removeEventListener("selectionchange", handleSelectionChange);
        };
    }, []);

    const updateButtonStates = () => {
        setIsBold(document.queryCommandState("bold"));
        setIsItalic(document.queryCommandState("italic"));
        setTextAlign(document.queryCommandState("justifyRight") ? "right" : "left");

        const currentColor = document.queryCommandValue("foreColor");
        if (currentColor) {
            setColor(convertColor(currentColor));
        }
    };

    // Listen for selection changes (mouse and keyboard events)
    useEffect(() => {
        const handleSelectionChange = () => updateButtonStates();
        document.addEventListener("mouseup", handleSelectionChange);
        document.addEventListener("keyup", handleSelectionChange);
        return () => {
            document.removeEventListener("mouseup", handleSelectionChange);
            document.removeEventListener("keyup", handleSelectionChange);
        };
    }, []);

    const applyCommand = (command: string, value?: string | number) => {
        const formattedValue =
            value !== undefined && typeof value === "number" ? value.toString() : value;
        document.execCommand("styleWithCSS", false, "true");
        document.execCommand(command, false, formattedValue);
        updateButtonStates();
    };

    const handleColorChange = (newColor: string) => {
        setColor(newColor);
        // Ensure the editor is focused before applying the command
        editorRef.current?.focus();
        applyCommand("foreColor", newColor);
    };

    // Formatting command handlers
    const handleBold = () => applyCommand("bold");
    const handleItalic = () => applyCommand("italic");
    const handleFontChange = (newFont: string) => {
        setFont(newFont);
        applyCommand("fontName", newFont);
    };

    // Note: execCommand('fontSize') accepts values 1–7. Here we use the number directly.
    const handleFontSizeDecrease = () => {
        const newSize = Math.max(10, fontSize - 1);
        setFontSize(newSize);
        applyCommand("fontSize", newSize);
    };

    const handleFontSizeIncrease = () => {
        const newSize = fontSize + 1;
        setFontSize(newSize);
        applyCommand("fontSize", newSize);
    };

    const handleFontSizeInputChange = (value: number) => {
        const newSize = Math.max(10, value);
        setFontSize(newSize);
        applyCommand("fontSize", newSize);
    };

    const handleTextAlignToggle = () => {
        if (textAlign === "left") {
            applyCommand("justifyRight");
            setTextAlign("right");
        } else {
            applyCommand("justifyLeft");
            setTextAlign("left");
        }
    };

    const handleTextSave = async () => {
        const content = editorRef.current?.innerHTML;
        if (!content || !content.trim() || content === "<br>") {
            setMessage({ text: "Please enter text before saving.", type: "error" });
            return;
        }

        setLoadingText(true);
        try {
            const response = await fetch("/api/saveText", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to save text");

            setMessage({ text: data.message, type: "success" });
            if (editorRef.current) {
                editorRef.current.innerHTML = "";
            }
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
                <div
                    className={`mb-4 p-3 text-white rounded-md ${message.type === "success" ? "bg-green-500" : "bg-red-500"
                        }`}
                >
                    {message.text}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-[0_1px_3px_0_rgba(0,0,0,0.12)]">
                <div className="flex gap-4 p-3 border-b border-[#dadce0] flex-wrap">
                    <select
                        className="h-9 px-3 bg-white border border-[#dadce0] rounded-md text-sm text-[#1f1f1f] hover:bg-[#f8f9fa] focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] outline-none transition-all"
                        value={font}
                        onChange={(e) => handleFontChange(e.target.value)}
                    >
                        {fontOptions.map((fnt) => (
                            <option key={fnt} value={fnt} style={{ fontFamily: fnt }}>
                                {fnt}
                            </option>
                        ))}
                    </select>

                    <div className="flex items-center space-x-1 border-r border-[#dadce0] pr-4">
                        <button
                            className={`w-7 h-7 rounded-md flex items-center justify-center hover:bg-[#f1f3f4] ${isBold ? "bg-[#e8f0fe] text-[#1967d2]" : "text-[#1f1f1f]"
                                }`}
                            onClick={handleBold}
                        >
                            <span className="font-bold">B</span>
                        </button>
                        <button
                            className={`w-7 h-7 rounded-md flex items-center justify-center hover:bg-[#f1f3f4] ${isItalic ? "bg-[#e8f0fe] text-[#1967d2]" : "text-[#1f1f1f]"
                                }`}
                            onClick={handleItalic}
                        >
                            <span className="italic">I</span>
                        </button>
                    </div>

                    <div className="relative inline-block">
                        {/* Hidden native color input */}
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => handleColorChange(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            id="colorPicker"
                        />
                        {/* Visible circle showing the selected color */}
                        <div
                            className="w-8 h-8 rounded-full border border-gray-300"
                            style={{ backgroundColor: color }}
                        />
                    </div>

                    <div className="flex items-center gap-1 border-r border-[#dadce0] pr-4">
                        <button
                            className={`w-7 h-7 rounded-md flex items-center justify-center hover:bg-[#f1f3f4] ${textAlign === "right" ? "bg-[#e8f0fe] text-[#1967d2]" : "text-[#1f1f1f]"
                                }`}
                            onClick={handleTextAlignToggle}
                        >
                            <span>{textAlign === "left" ? "➡️" : "⬅️"}</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-[#f1f3f4] text-[#1f1f1f]"
                            onClick={handleFontSizeDecrease}
                        >
                            <span className="text-lg">-</span>
                        </button>
                        <input
                            type="number"
                            value={fontSize}
                            onChange={(e) => handleFontSizeInputChange(parseInt(e.target.value) || 10)}
                            className="w-12 h-8 text-center border border-[#dadce0] rounded-md text-sm outline-none focus:border-[#1a73e8]"
                        />
                        <button
                            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-[#f1f3f4] text-[#1f1f1f]"
                            onClick={handleFontSizeIncrease}
                        >
                            <span className="text-lg">+</span>
                        </button>
                    </div>
                </div>

                {/* Rich text editor */}
                <div
                    ref={editorRef}
                    contentEditable
                    className="w-full min-h-[200px] p-8 text-[#1f1f1f] text-[14px] leading-[1.5] font-sans outline-none resize-none placeholder:text-[#80868b]"
                    style={{ textAlign }}
                />

            </div>

            <div className="mt-6 flex justify-center">
                <button
                    className="px-6 py-2 rounded-md bg-[#1a73e8] text-white hover:bg-[#1557b0] disabled:bg-[#9aa0a6] disabled:cursor-not-allowed transition-colors"
                    onClick={handleTextSave}
                    disabled={loadingText}
                >
                    {loadingText ? "Saving..." : "Save Text"}
                </button>
            </div>
        </div>
    );
};

export default SaveText;
