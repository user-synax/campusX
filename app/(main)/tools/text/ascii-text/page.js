"use client";

import { useState, useEffect } from "react";
import { Copy, Type, RefreshCw } from "lucide-react";
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
import figlet from "figlet";
// Import a basic font for browser usage
import standard from "figlet/importable-fonts/Standard";

export default function AsciiTextTool() {
    const [input, setInput] = useState("CampusZen");
    const [output, setOutput] = useState("");
    const [font, setFont] = useState("Standard");

    useEffect(() => {
        figlet.parseFont("Standard", standard);
        generateAscii();
    }, []);

    const generateAscii = () => {
        if (!input) {
            setOutput("");
            return;
        }

        figlet.text(
            input,
            {
                font: "Standard",
                horizontalLayout: "default",
                verticalLayout: "default",
                width: 80,
                whitespaceBreak: true,
            },
            function (err, data) {
                if (err) {
                    console.error("Figlet error:", err);
                    return;
                }
                setOutput(data);
            }
        );
    };

    useEffect(() => {
        generateAscii();
    }, [input]);

    const copyToClipboard = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        toast.success("ASCII art copied to clipboard");
    };

    return (
        <TextToolLayout
            title="ASCII Art Text"
            description="Create stylized ASCII banner art from your text using classic FIGlet fonts."
        >
            <div className="grid grid-cols-1 gap-8">
                <div className="space-y-4">
                    <Label className="text-lg font-semibold">Input Text</Label>
                    <div className="flex gap-4">
                        <Textarea
                            placeholder="Enter text here..."
                            className="flex-1 text-lg"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-lg font-semibold">Output</Label>
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
                    <div className="relative w-full min-h-[300px] rounded-2xl border border-border bg-muted/30 p-6 overflow-auto font-mono text-sm whitespace-pre">
                        {output || (
                            <span className="text-muted-foreground italic">
                                ASCII art will appear here...
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </TextToolLayout>
    );
}
