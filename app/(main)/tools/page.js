import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
    Fingerprint,
    Database,
    ShieldCheck,
    Hash,
    FileType,
    Keyboard,
    MousePointer2,
    Type,
    Scaling,
    Lock,
    Link2,
    Hash as HashIcon,
    Copyright,
    Search,
    QrCode,
    Code2,
    ArrowLeftRight,
    FileCode,
    Eye,
    Layout,
    Calculator,
    ImageIcon,
    Clock,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Developer Tools | CampusZen",
    description: "A suite of useful utilities for developers.",
};

const tools = [
    {
        title: "UUID & ULID Generators",
        description:
            "Generate unique identifiers with support for UUID v1, v4 and ULIDs.",
        icon: <Fingerprint className="w-5 h-5 text-indigo-500" />,
        href: "/tools/uuid",
        className: "sm:col-span-2 md:col-span-1 lg:col-span-2",
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
    {
        title: "QR Code Generator",
        description: "Generate customizable QR images from text or URLs.",
        icon: <QrCode className="w-5 h-5 text-pink-500" />,
        href: "/tools/qr-generator",
        className: "md:col-span-2",
    },
    {
        title: "JSON → Code",
        description: "Convert JSON to TypeScript interfaces or React PropTypes.",
        icon: <Code2 className="w-5 h-5 text-emerald-500" />,
        href: "/tools/json-to-code",
        className: "md:col-span-1",
    },
    {
        title: "HTML ⇄ JSX",
        description: "Convert HTML snippets to React-ready JSX components.",
        icon: <FileType className="w-5 h-5 text-orange-500" />,
        href: "/tools/html-jsx",
        className: "md:col-span-1",
    },
    {
        title: "Query String ↔ JSON",
        description: "Bidirectional URL parameter and JSON conversion.",
        icon: <ArrowLeftRight className="w-5 h-5 text-cyan-500" />,
        href: "/tools/query-converter",
        className: "md:col-span-2",
    },
    {
        title: "Data URL Generator",
        description: "Convert files to base64 encoded Data URIs.",
        icon: <FileCode className="w-5 h-5 text-amber-500" />,
        href: "/tools/data-url",
        className: "md:col-span-1",
    },
    {
        title: "HTML Previewer",
        description: "Sandboxed live preview for HTML and CSS snippets.",
        icon: <Eye className="w-5 h-5 text-rose-500" />,
        href: "/tools/html-previewer",
        className: "md:col-span-1",
    },
    {
        title: "SCSS Formatter",
        description: "Beautify or minify SCSS code with custom indentation.",
        icon: <Layout className="w-5 h-5 text-purple-500" />,
        href: "/tools/scss-formatter",
        className: "md:col-span-2",
    },
    {
        title: "Semver Calculator",
        description: "Parse, compare, and calculate semantic versions.",
        icon: <Calculator className="w-5 h-5 text-sky-500" />,
        href: "/tools/semver",
        className: "md:col-span-1",
    },
    {
        title: "SVG ⇄ CSS",
        description: "Convert SVG to CSS background-image or mask-image.",
        icon: <ImageIcon className="w-5 h-5 text-green-500" />,
        href: "/tools/svg-css",
        className: "md:col-span-1",
    },
    {
        title: "UID / ULID Decoder",
        description: "Extract timestamps and info from ULIDs and UUIDs.",
        icon: <Clock className="w-5 h-5 text-yellow-500" />,
        href: "/tools/ulid-decoder",
        className: "md:col-span-1",
    },
    {
        title: "PHP Serializer",
        description: "Converter for PHP's serialize() format to JSON.",
        icon: <Database className="w-5 h-5 text-red-500" />,
        href: "/tools/php-serializer",
        className: "md:col-span-1",
    },
    {
        title: "Dummy Data Generator",
        description:
            "Generate realistic mock data for users, products, and more using Faker.js.",
        icon: <Database className="w-5 h-5 text-red-500" />,
        href: "/tools/faker",
        className: "sm:col-span-2 md:col-span-1 lg:col-span-2",
    },
    {
        title: "JWT Tools",
        description:
            "Decode, verify, and generate JSON Web Tokens for testing and debugging.",
        icon: <ShieldCheck className="w-5 h-5 text-green-500" />,
        href: "/tools/jwt",
        className: "md:col-span-2",
    },
    {
        title: "Hash Generator",
        description:
            "Create cryptographic hashes using MD5, SHA-1, SHA-256, and more.",
        icon: <Hash className="w-5 h-5" />,
        href: "/tools/hash",
        className: "md:col-span-1",
    },
    {
        title: "SVG to React",
        description:
            "Convert SVG code into clean, reusable React components instantly.",
        icon: <FileType className="w-5 h-5" />,
        href: "/tools/svg-to-react",
        className: "md:col-span-1",
    },
    {
        title: "Keyboard Info",
        description:
            "Capture and visualize keyboard events and key codes in real-time.",
        icon: <Keyboard className="w-5 h-5" />,
        href: "/tools/keyboard",
        className: "md:col-span-2",
    },
    {
        title: "CSS Cursor Viewer",
        description: "Interactive preview of all available CSS cursor styles.",
        icon: <MousePointer2 className="w-5 h-5" />,
        href: "/tools/css-cursor",
        className: "md:col-span-1",
    },
    {
        title: "CSS Specificity",
        description: "Calculate and compare CSS selector specificity weight.",
        icon: <Type className="w-5 h-5" />,
        href: "/tools/css-specificity",
        className: "md:col-span-1",
    },
    {
        title: "Responsive Fonts",
        description:
            "Preview and test responsive font scaling across different viewports.",
        icon: <Scaling className="w-5 h-5" />,
        href: "/tools/responsive-fonts",
        className: "sm:col-span-2 md:col-span-1 lg:col-span-2",
    },
    {
        title: "Chmod Calculator",
        description: "Visual calculator for Unix file permissions (chmod).",
        icon: <Lock className="w-5 h-5" />,
        href: "/tools/chmod",
        className: "md:col-span-1",
    },
    {
        title: "Slug Generator",
        description: "Convert any text into a URL-friendly slug.",
        icon: <Link2 className="w-5 h-5" />,
        href: "/tools/slug",
        className: "md:col-span-1",
    },
    {
        title: "Line Counter",
        description: "Count lines, words, and characters in your code or text.",
        icon: <HashIcon className="w-5 h-5" />,
        href: "/tools/line-counter",
        className: "md:col-span-2",
    },
    {
        title: "Copyright Generator",
        description: "Generate license headers and footer copyright snippets.",
        icon: <Copyright className="w-5 h-5" />,
        href: "/tools/copyright",
        className: "md:col-span-2",
    },
    {
        title: "SEO Tools",
        description: "Audit meta tags, check alt text, generate social share links, and more.",
        icon: <Search className="w-5 h-5 text-teal-500" />,
        href: "/tools/seo",
        className: "sm:col-span-2 md:col-span-1 lg:col-span-2",
    },
];

export default function ToolsPage() {
    return (
        <div className="container mx-auto py-12 px-4">
            <div className="mb-12 space-y-4">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter bg-linear-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">
                    Developer Tools
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl font-medium">
                    A collection of essential utilities to streamline your
                    development workflow. Built for developers, by developers.
                </p>
            </div>

            <BentoGrid>
                {tools.map((tool, index) => (
                    <Link key={tool.href} href={tool.href}>
                        <BentoGridItem
                            title={tool.title}
                            description={tool.description}
                            icon={tool.icon}
                            className={tool.className}
                        />
                    </Link>
                ))}
            </BentoGrid>
        </div>
    );
}
