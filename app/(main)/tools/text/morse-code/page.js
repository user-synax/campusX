"use client";

import { useState, useEffect } from "react";
import { Copy, Hash, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import TextToolLayout from "@/components/tools/TextToolLayout";
import { toast } from "sonner";

const MORSE_CODE = {
    A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
    I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
    Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
    Y: "-.--", Z: "--..", "0": "-----", "1": ".----", "2": "..---", "3": "...--",
    "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
    ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--",
    "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...",
    ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-",
    '"': ".-..-.", "$": "...-..-", "@": ".--.-.", " ": "/",
};

const REVERSE_MORSE = Object.fromEntries(
    Object.entries(MORSE_CODE).map(([k, v]) => [v, k])
);

export default function MorseCodeTool() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [mode, setMode] = useState("encode"); // encode or decode

    const translate = () => {
        if (!input) {
            setOutput("");
            return;
        }

        if (mode === "encode") {
            const result = input
                .toUpperCase()
                .split("")
                .map((char) => MORSE_CODE[char] || char)
                .join(" ");
            setOutput(result);
        } else {
            const result = input
                .trim()
                .split(/\s+/)
                .map((code) => REVERSE_MORSE[code] || code)
                .join("");
            setOutput(result);
        }
    };

    useEffect(() => {
        translate();
    }, [input, mode]);

    const copyToClipboard = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        toast.success("Copied to clipboard");
    };

    return (
        <TextToolLayout
            title="Morse Code Translator"
            description="Translate text to Morse code and vice versa in real-time."
        >
            <div className="space-y-6">
                <div className="flex justify-center gap-4">
                    <Button
                        variant={mode === "encode" ? "default" : "outline"}
                        onClick={() => setMode("encode")}
                        className="w-40"
                    >
                        Text to Morse
                    </Button>
                    <Button
                        variant={mode === "decode" ? "default" : "outline"}
                        onClick={() => setMode("decode")}
                        className="w-40"
                    >
                        Morse to Text
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold">
                                {mode === "encode" ? "Input Text" : "Input Morse Code"}
                            </Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setInput("")}
                                className="text-muted-foreground"
                            >
                                Clear
                            </Button>
                        </div>
                        <Textarea
                            placeholder={
                                mode === "encode"
                                    ? "Type text to translate..."
                                    : "Type dots (.) and dashes (-) separated by spaces..."
                            }
                            className="min-h-[300px] text-lg resize-none p-4 font-mono"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold">
                                {mode === "encode" ? "Output Morse" : "Output Text"}
                            </Label>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={copyToClipboard}
                                disabled={!output}
                            >
                                <Copy className="w-4 h-4 mr-2" />
                                Copy
                            </Button>
                        </div>
                        <div className="min-h-[300px] w-full rounded-md border border-input bg-muted/30 p-4 text-lg font-mono break-all whitespace-pre-wrap">
                            {output || (
                                <span className="text-muted-foreground italic">
                                    Translation will appear here...
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </TextToolLayout>
    );
}
