"use client";

import { useState, useEffect } from "react";
import { Copy, CaseUpper, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import TextToolLayout from "@/components/tools/TextToolLayout";
import { toast } from "sonner";

export default function CaseConverterTool() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");

    const converters = {
        lowercase: (str) => str.toLowerCase(),
        uppercase: (str) => str.toUpperCase(),
        titleCase: (str) =>
            str
                .toLowerCase()
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" "),
        sentenceCase: (str) =>
            str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(),
        camelCase: (str) =>
            str
                .toLowerCase()
                .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()),
        pascalCase: (str) => {
            const camel = str
                .toLowerCase()
                .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
            return camel.charAt(0).toUpperCase() + camel.slice(1);
        },
        snakeCase: (str) =>
            str
                .match(
                    /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
                )
                .map((x) => x.toLowerCase())
                .join("_"),
        kebabCase: (str) =>
            str
                .match(
                    /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
                )
                .map((x) => x.toLowerCase())
                .join("-"),
        constantCase: (str) =>
            str
                .match(
                    /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
                )
                .map((x) => x.toUpperCase())
                .join("_"),
        toggleCase: (str) =>
            str
                .split("")
                .map((c) =>
                    c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()
                )
                .join(""),
    };

    const convert = (type) => {
        if (!input) return;
        try {
            const result = converters[type](input);
            setOutput(result);
            toast.success(`Converted to ${type}`);
        } catch (error) {
            toast.error("Error converting text");
        }
    };

    const copyToClipboard = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        toast.success("Copied to clipboard");
    };

    return (
        <TextToolLayout
            title="Text Case Converter"
            description="Quickly transform your text into various formats including camelCase, snake_case, and more."
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-lg font-semibold">Input Text</Label>
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
                        placeholder="Paste or type your text here..."
                        className="min-h-[300px] text-lg resize-none p-4"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-lg font-semibold">Output Text</Label>
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
                        {output || <span className="text-muted-foreground italic">Converted text will appear here...</span>}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                {Object.keys(converters).map((type) => (
                    <Button
                        key={type}
                        variant="secondary"
                        className="capitalize text-xs sm:text-sm"
                        onClick={() => convert(type)}
                        disabled={!input}
                    >
                        {type.replace(/([A-Z])/g, " $1")}
                    </Button>
                ))}
            </div>
        </TextToolLayout>
    );
}
