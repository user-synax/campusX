"use client";

import { useState, useEffect } from "react";
import { Copy, RefreshCw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import TextToolLayout from "@/components/tools/TextToolLayout";
import { toast } from "sonner";
import { faker } from "@faker-js/faker";

export default function LoremIpsumTool() {
    const [count, setCount] = useState(3);
    const [type, setType] = useState("paragraphs");
    const [output, setOutput] = useState("");
    const [copied, setCopied] = useState(false);

    const generateLorem = () => {
        let result = "";
        if (type === "paragraphs") {
            result = faker.lorem.paragraphs(count, "\n\n");
        } else if (type === "sentences") {
            result = faker.lorem.sentences(count);
        } else if (type === "words") {
            result = faker.lorem.words(count);
        } else if (type === "bytes") {
            // Generate words until we hit the byte count
            result = faker.lorem.paragraphs(Math.ceil(count / 50));
            result = result.substring(0, count);
        }
        setOutput(result);
    };

    useEffect(() => {
        generateLorem();
    }, [count, type]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <TextToolLayout
            title="Lorem Ipsum Generator"
            description="Generate customizable placeholder text for your designs and layouts."
        >
            <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                <div className="space-y-6 md:col-span-1">
                    <div className="space-y-4 p-6 rounded-2xl border border-border bg-card">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="paragraphs">Paragraphs</SelectItem>
                                    <SelectItem value="sentences">Sentences</SelectItem>
                                    <SelectItem value="words">Words</SelectItem>
                                    <SelectItem value="bytes">Bytes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>Count: {count}</Label>
                            </div>
                            <Slider
                                value={[count]}
                                min={1}
                                max={type === "words" || type === "bytes" ? 500 : 50}
                                step={1}
                                onValueChange={(val) => setCount(val[0])}
                            />
                        </div>

                        <Button
                            className="w-full"
                            variant="outline"
                            onClick={generateLorem}
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Regenerate
                        </Button>

                        <Button
                            className="w-full"
                            onClick={copyToClipboard}
                            disabled={!output}
                        >
                            <Copy className="w-4 h-4 mr-2" />
                            {copied ? "Copied!" : "Copy Text"}
                        </Button>
                    </div>
                </div>

                <div className="md:col-span-3">
                    <div className="relative h-full min-h-[400px] rounded-2xl border border-border bg-muted/30 p-6 overflow-auto font-serif text-lg leading-relaxed">
                        {output.split("\n\n").map((p, i) => (
                            <p key={i} className={i > 0 ? "mt-4" : ""}>
                                {p}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </TextToolLayout>
    );
}
