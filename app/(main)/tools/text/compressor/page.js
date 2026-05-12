"use client";

import { useState, useEffect } from "react";
import { Copy, Zap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import TextToolLayout from "@/components/tools/TextToolLayout";
import { toast } from "sonner";

export default function CompressorTool() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [method, setMethod] = useState("base64");
    const [mode, setMode] = useState("compress");

    const rleCompress = (str) => {
        if (!str) return "";
        let compressed = "";
        let count = 1;
        for (let i = 0; i < str.length; i++) {
            if (str[i] === str[i + 1]) {
                count++;
            } else {
                compressed += (count > 1 ? count : "") + str[i];
                count = 1;
            }
        }
        return compressed;
    };

    const rleDecompress = (str) => {
        if (!str) return "";
        let decompressed = "";
        let countStr = "";
        for (let i = 0; i < str.length; i++) {
            if (/[0-9]/.test(str[i])) {
                countStr += str[i];
            } else {
                const count = countStr === "" ? 1 : parseInt(countStr);
                decompressed += str[i].repeat(count);
                countStr = "";
            }
        }
        return decompressed;
    };

    const process = () => {
        if (!input) {
            setOutput("");
            return;
        }

        try {
            let result = "";
            if (method === "base64") {
                result = mode === "compress" 
                    ? btoa(input) 
                    : atob(input);
            } else if (method === "rle") {
                result = mode === "compress"
                    ? rleCompress(input)
                    : rleDecompress(input);
            } else if (method === "uri") {
                result = mode === "compress"
                    ? encodeURIComponent(input)
                    : decodeURIComponent(input);
            }
            setOutput(result);
        } catch (error) {
            setOutput("Error: Invalid input for this operation");
        }
    };

    useEffect(() => {
        process();
    }, [input, method, mode]);

    const copyToClipboard = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        toast.success("Copied to clipboard");
    };

    const compressionRatio = input && output && mode === "compress"
        ? (((input.length - output.length) / input.length) * 100).toFixed(1)
        : null;

    return (
        <TextToolLayout
            title="Text Compressor"
            description="Compress and decompress text using various algorithms like Base64, RLE, and URI encoding."
        >
            <div className="space-y-6">
                <div className="flex flex-wrap justify-center gap-4">
                    <Select value={method} onValueChange={setMethod}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Algorithm" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="base64">Base64</SelectItem>
                            <SelectItem value="rle">Run-Length (RLE)</SelectItem>
                            <SelectItem value="uri">URI Component</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                        <Button
                            variant={mode === "compress" ? "default" : "outline"}
                            onClick={() => setMode("compress")}
                            className="w-32"
                        >
                            Compress
                        </Button>
                        <Button
                            variant={mode === "decompress" ? "default" : "outline"}
                            onClick={() => setMode("decompress")}
                            className="w-32"
                        >
                            Decompress
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold">Input</Label>
                            <span className="text-xs text-muted-foreground">{input.length} chars</span>
                        </div>
                        <Textarea
                            placeholder="Enter text to process..."
                            className="min-h-[300px] text-lg resize-none p-4 font-mono"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold">Output</Label>
                            <div className="flex items-center gap-3">
                                {compressionRatio !== null && (
                                    <span className={`text-xs font-medium ${parseFloat(compressionRatio) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {compressionRatio}% {parseFloat(compressionRatio) > 0 ? 'saved' : 'increase'}
                                    </span>
                                )}
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
                        </div>
                        <div className="min-h-[300px] w-full rounded-md border border-input bg-muted/30 p-4 text-lg font-mono break-all whitespace-pre-wrap">
                            {output || (
                                <span className="text-muted-foreground italic">
                                    Result will appear here...
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </TextToolLayout>
    );
}
