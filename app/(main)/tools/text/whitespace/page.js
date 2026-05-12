"use client";

import { useState, useEffect } from "react";
import { Copy, Eraser, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import TextToolLayout from "@/components/tools/TextToolLayout";
import { toast } from "sonner";

export default function WhitespaceTool() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [options, setOptions] = useState({
        trim: true,
        removeEmptyLines: true,
        collapseSpaces: true,
        removeTabs: false,
        stripAllWhitespace: false,
    });

    const process = () => {
        if (!input) {
            setOutput("");
            return;
        }

        let result = input;

        if (options.stripAllWhitespace) {
            result = result.replace(/\s+/g, "");
        } else {
            if (options.trim) {
                result = result.split("\n").map(line => line.trim()).join("\n").trim();
            }
            if (options.collapseSpaces) {
                result = result.replace(/[ \t]+/g, " ");
            }
            if (options.removeTabs) {
                result = result.replace(/\t/g, " ");
            }
            if (options.removeEmptyLines) {
                result = result.split("\n").filter(line => line.trim() !== "").join("\n");
            }
        }

        setOutput(result);
    };

    useEffect(() => {
        process();
    }, [input, options]);

    const copyToClipboard = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        toast.success("Copied to clipboard");
    };

    const toggleOption = (key) => {
        setOptions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <TextToolLayout
            title="Whitespace Cleaner"
            description="Optimize your text by removing unnecessary spaces, tabs, and empty lines."
        >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
                        <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Options</Label>
                        
                        <div className="space-y-3">
                            {Object.entries({
                                trim: "Trim Lines",
                                removeEmptyLines: "Remove Empty Lines",
                                collapseSpaces: "Collapse Spaces",
                                removeTabs: "Convert Tabs to Spaces",
                                stripAllWhitespace: "Strip All Whitespace",
                            }).map(([key, label]) => (
                                <div key={key} className="flex items-center space-x-3">
                                    <Checkbox 
                                        id={key} 
                                        checked={options[key]} 
                                        onCheckedChange={() => toggleOption(key)}
                                    />
                                    <Label htmlFor={key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                        {label}
                                    </Label>
                                </div>
                            ))}
                        </div>

                        <Button 
                            variant="outline" 
                            className="w-full mt-4"
                            onClick={() => setInput("")}
                        >
                            Clear Input
                        </Button>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                    <div className="space-y-4">
                        <Label className="text-lg font-semibold">Input Text</Label>
                        <Textarea
                            placeholder="Paste your messy text here..."
                            className="min-h-[200px] text-lg font-mono"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold">Cleaned Text</Label>
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
                        <div className="min-h-[200px] w-full rounded-md border border-input bg-muted/30 p-4 text-lg font-mono whitespace-pre-wrap">
                            {output || (
                                <span className="text-muted-foreground italic">
                                    Cleaned text will appear here...
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </TextToolLayout>
    );
}
