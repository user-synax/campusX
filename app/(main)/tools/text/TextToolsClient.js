"use client";

import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
    Type,
    FileText,
    ImageIcon,
    CaseUpper,
    Binary,
    Hash,
    Code,
    Zap,
    Eraser,
    Link2,
    SortAsc,
    Split,
    Timer,
    Calculator,
    Search,
} from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import Link from "next/link";
import { useState, useEffect } from "react";

const textTools = [
    {
        title: "Lorem Ipsum Generator",
        description: "Customizable placeholder text for your designs and layouts.",
        icon: <FileText className="w-5 h-5 text-blue-500" />,
        href: "/tools/text/lorem-ipsum",
        className: "md:col-span-2",
    },
    {
        title: "ASCII Art Text",
        description: "Convert your text into stylized ASCII banner art.",
        icon: <Type className="w-5 h-5 text-purple-500" />,
        href: "/tools/text/ascii-text",
        className: "md:col-span-1",
    },
    {
        title: "ASCII Art Generator",
        description: "Transform images into ASCII character representations.",
        icon: <ImageIcon className="w-5 h-5 text-green-500" />,
        href: "/tools/text/ascii-image",
        className: "md:col-span-1",
    },
    {
        title: "Text Case Converter",
        description: "Switch between camelCase, snake_case, PascalCase, and more.",
        icon: <CaseUpper className="w-5 h-5 text-orange-500" />,
        href: "/tools/text/case-converter",
        className: "md:col-span-2",
    },
    {
        title: "ROT13 Encoder",
        description: "Simple reversible cipher for obfuscating text.",
        icon: <Binary className="w-5 h-5 text-red-500" />,
        href: "/tools/text/rot13",
        className: "md:col-span-1",
    },
    {
        title: "Morse Code Translator",
        description: "Translate text to Morse code and vice versa.",
        icon: <Hash className="w-5 h-5 text-yellow-500" />,
        href: "/tools/text/morse-code",
        className: "md:col-span-1",
    },
    {
        title: "Escape / Unescape",
        description: "Handle JS, JSON, and Regex escaping needs.",
        icon: <Code className="w-5 h-5 text-cyan-500" />,
        href: "/tools/text/escape",
        className: "md:col-span-2",
    },
    {
        title: "Text Compressor",
        description: "Compress and decompress text using RLE and Base64.",
        icon: <Zap className="w-5 h-5 text-indigo-500" />,
        href: "/tools/text/compressor",
        className: "md:col-span-1",
    },
    {
        title: "Whitespace Cleaner",
        description: "Trim, collapse spaces, and remove empty lines.",
        icon: <Eraser className="w-5 h-5 text-pink-500" />,
        href: "/tools/text/whitespace",
        className: "md:col-span-1",
    },
    {
        title: "Slug Generator",
        description: "Create clean, URL-friendly slugs from raw text.",
        icon: <Link2 className="w-5 h-5 text-emerald-500" />,
        href: "/tools/text/slug",
        className: "md:col-span-1",
    },
    {
        title: "Line Sort & Dedupe",
        description: "Sort lines alphabetically and remove duplicates.",
        icon: <SortAsc className="w-5 h-5 text-amber-500" />,
        href: "/tools/text/sort-dedupe",
        className: "md:col-span-1",
    },
    {
        title: "Text Delimiter",
        description: "Split and join text based on custom delimiters.",
        icon: <Split className="w-5 h-5 text-sky-500" />,
        href: "/tools/text/delimiter",
        className: "md:col-span-2",
    },
    {
        title: "Reading Time Estimator",
        description: "Estimate reading and speaking time for your text.",
        icon: <Timer className="w-5 h-5 text-violet-500" />,
        href: "/tools/text/reading-time",
        className: "md:col-span-2",
    },
    {
        title: "Text Metrics",
        description: "Count characters, words, sentences, and paragraphs.",
        icon: <Calculator className="w-5 h-5 text-rose-500" />,
        href: "/tools/text/metrics",
        className: "md:col-span-1",
    },
    {
        title: "Regex Tester",
        description: "Live regex testing with real-time matching and highlighting.",
        icon: <Search className="w-5 h-5 text-violet-500" />,
        href: "/tools/regex-tester",
        className: "md:col-span-1",
    },
    {
        title: "URL Parser",
        description: "Detailed URL component inspection and query parameter breakdown.",
        icon: <Link2 className="w-5 h-5 text-blue-500" />,
        href: "/tools/url-parser",
        className: "md:col-span-1",
    },
];

export default function TextToolsClient() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <ToolLayout
            title="Text Tools"
            description="A specialized collection of utilities for text generation, conversion, cleanup, and analysis."
        >
            <BentoGrid>
                {textTools.map((tool, index) => (
                    <Link key={index} href={tool.href}>
                        <BentoGridItem
                            title={tool.title}
                            description={tool.description}
                            icon={tool.icon}
                            className={tool.className}
                        />
                    </Link>
                ))}
            </BentoGrid>
        </ToolLayout>
    );
}
