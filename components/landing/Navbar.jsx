"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuTrigger,
    NavigationMenuContent,
    NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowRight, GraduationCap, Shield, Zap, LogOut, User } from "lucide-react";

export default function Navbar() {
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch('/api/users/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (error) {
                console.error('Failed to fetch session:', error);
            } finally {
                setLoading(false);
            }
        };
        checkSession();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            window.location.href = '/';
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    };

    const featuresItems = [
        {
            title: "Social Feed",
            description: "Posts, polls, reactions from your college",
        },
        {
            title: "Resources",
            description: "Notes, PYQs, coding materials — free",
        },
        {
            title: "Whiteboard",
            description:
                "Get your personal free whiteboard, manage and learn your thinking into board",
        },
        {
            title: "Code area",
            description:
                "live Code with your friends and colleagues, with real time chat panel",
        },
        {
            title: "And much More...",
            description:
                "Create your account to explore campusX",
        },
    ];

    const aboutItems = [
        { icon: GraduationCap, label: "For Students" },
        { icon: Shield, label: "Safe & Verified" },
        { icon: Zap, label: "Built in India" },
    ];

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            suppressHydrationWarning
            className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
                scrolled
                    ? "bg-[#0f0f0f]/95 backdrop-blur-md shadow-lg shadow-black/20 border-[#2a2a2a]"
                    : "bg-[#0f0f0f]/80 backdrop-blur-sm border-transparent"
            }`}
        >
            <nav className="flex items-center justify-between h-16 px-4 lg:px-8 max-w-7xl mx-auto w-full">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2 font-black text-lg lg:text-xl text-[#f0f0f0] hover:opacity-80 transition-opacity shrink-0"
                >
                    <Zap className="w-5 h-5 lg:w-6 lg:h-6" />
                    <span className="hidden sm:inline">CampusX</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex flex-1 justify-center">
                    <div className="flex items-center gap-6 lg:gap-8">
                        <NavigationMenu>
                            <NavigationMenuList>
                                {/* Features Dropdown */}
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger className="text-[#a0a0a0] hover:text-[#f0f0f0] bg-transparent border-0 hover:bg-transparent">
                                        Features
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl">
                                        <div className="grid gap-3 p-4 w-96">
                                            {featuresItems.map((item) => (
                                                <div
                                                    key={item.title}
                                                    className="group cursor-pointer rounded-lg px-4 py-3 transition-all hover:bg-[#2a2a2a]"
                                                >
                                                    <p className="font-semibold text-[#f0f0f0] group-hover:text-[hsl(var(--primary))]">
                                                        {item.title}
                                                    </p>
                                                    <p className="text-sm text-[#808080]">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>

                                {/* Campus Coins Link */}
                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild>
                                        <Link
                                            href="#coins"
                                            className="text-[#a0a0a0] hover:text-[#f0f0f0] px-3 py-2 transition-colors whitespace-nowrap"
                                        >
                                            Campus Coins
                                        </Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>

                                {/* About Dropdown */}
                                {/* <NavigationMenuItem>
                                <NavigationMenuTrigger className="text-[#a0a0a0] hover:text-[#f0f0f0] bg-transparent border-0 hover:bg-transparent">
                                    About
                                </NavigationMenuTrigger>
                                <NavigationMenuContent className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl">
                                    <div className="grid gap-3 p-4 w-64">
                                        {aboutItems.map((item) => {
                                            const IconComponent = item.icon;
                                            return (
                                                <div
                                                    key={item.label}
                                                    className="group cursor-pointer rounded-lg px-4 py-3 transition-all hover:bg-[#2a2a2a] flex items-center gap-3"
                                                >
                                                    <IconComponent className="w-5 h-5 text-[hsl(var(--primary))] group-hover:scale-110 transition-transform" />
                                                    <p className="font-semibold text-[#f0f0f0] group-hover:text-[hsl(var(--primary))]">
                                                        {item.label}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </NavigationMenuContent>
                            </NavigationMenuItem> */}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>
                </div>

                {/* Right Side - Desktop Buttons */}
                <div className="hidden lg:flex items-center gap-2 lg:gap-3 shrink-0">
                    {mounted && !loading && user ? (
                        <div className="flex items-center gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex items-center gap-2 text-[#a0a0a0] hover:text-[#f0f0f0] text-xs lg:text-sm"
                                    >
                                        {user.image ? (
                                            <img
                                                src={user.image}
                                                alt={user.name}
                                                className="w-6 h-6 rounded-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-5 h-5" />
                                        )}
                                        <span className="hidden sm:inline">{user.name}</span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 bg-[#1a1a1a] border border-[#2a2a2a]">
                                    <div className="space-y-1">
                                        <Link
                                            href="/profile"
                                            className="block px-3 py-2 text-sm text-[#a0a0a0] hover:text-[#f0f0f0] hover:bg-[#2a2a2a] rounded-md"
                                        >
                                            Profile
                                        </Link>
                                        <Link
                                            href="/settings"
                                            className="block px-3 py-2 text-sm text-[#a0a0a0] hover:text-[#f0f0f0] hover:bg-[#2a2a2a] rounded-md"
                                        >
                                            Settings
                                        </Link>
                                        <hr className="border-[#2a2a2a] my-1" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#a0a0a0] hover:text-[#f0f0f0] hover:bg-[#2a2a2a] rounded-md"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    ) : (
                        <>
                            <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="text-[#a0a0a0] hover:text-[#f0f0f0] text-xs lg:text-sm"
                            >
                                <Link href="/login">Sign In</Link>
                            </Button>
                            <Button
                                asChild
                                size="sm"
                                className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/80 text-[#0f0f0f] font-semibold text-xs lg:text-sm"
                            >
                                <Link
                                    href="/signup"
                                    className="flex items-center gap-1"
                                >
                                    Join Free{" "}
                                    <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4" />
                                </Link>
                            </Button>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="lg:hidden">
                    <Popover
                        open={mobileMenuOpen}
                        onOpenChange={setMobileMenuOpen}
                    >
                        <PopoverTrigger asChild>
                            <button className="text-[#f0f0f0] p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors">
                                {mobileMenuOpen ? (
                                    <X className="w-6 h-6" />
                                ) : (
                                    <Menu className="w-6 h-6" />
                                )}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 space-y-3 mt-2 max-w-96"
                            align="end"
                        >
                            {/* Mobile Features */}
                            <div className="space-y-2">
                                <p className="font-semibold text-[#f0f0f0] px-2">
                                    Features
                                </p>
                                {featuresItems.map((item) => (
                                    <Link
                                        key={item.title}
                                        href="#"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-4 py-2 rounded-lg text-[#a0a0a0] hover:bg-[#2a2a2a] hover:text-[#f0f0f0] transition-colors"
                                    >
                                        {item.title}
                                    </Link>
                                ))}
                            </div>

                            {/* Mobile Campus Coins */}
                            <Link
                                href="#coins"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-4 py-2 rounded-lg text-[#a0a0a0] hover:bg-[#2a2a2a] hover:text-[#f0f0f0] transition-colors"
                            >
                                Campus Coins
                            </Link>

                            {/* Mobile About */}
                            {/* <div className="space-y-2">
                                <p className="font-semibold text-[#f0f0f0] px-2">
                                    About
                                </p>
                                {aboutItems.map((item) => {
                                    const IconComponent = item.icon;
                                    return (
                                        <div
                                            key={item.label}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#a0a0a0] hover:bg-[#2a2a2a] hover:text-[#f0f0f0] transition-colors"
                                        >
                                            <IconComponent className="w-4 h-4" />
                                            <span>{item.label}</span>
                                        </div>
                                    );
                                })}
                            </div> */}

                            {/* Mobile Buttons */}
                            <div className="space-y-2 pt-4 border-t border-[#2a2a2a]">
                                {mounted && !loading && user ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 px-2 py-2">
                                            {user.image ? (
                                                <img
                                                    src={user.image}
                                                    alt={user.name}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-8 h-8 text-[#a0a0a0]" />
                                            )}
                                            <div>
                                                <p className="text-sm font-semibold text-[#f0f0f0]">{user.name}</p>
                                                <p className="text-xs text-[#808080]">{user.email}</p>
                                            </div>
                                        </div>
                                        <Link
                                            href="/profile"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block px-4 py-2 rounded-lg text-sm text-[#a0a0a0] hover:bg-[#2a2a2a] hover:text-[#f0f0f0] transition-colors"
                                        >
                                            Profile
                                        </Link>
                                        <Link
                                            href="/settings"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block px-4 py-2 rounded-lg text-sm text-[#a0a0a0] hover:bg-[#2a2a2a] hover:text-[#f0f0f0] transition-colors"
                                        >
                                            Settings
                                        </Link>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setMobileMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-[#a0a0a0] hover:bg-[#2a2a2a] hover:text-[#f0f0f0] transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="sm"
                                            className="w-full text-[#a0a0a0] hover:text-[#f0f0f0]"
                                        >
                                            <Link href="/login">Sign In</Link>
                                        </Button>
                                        <Button
                                            asChild
                                            size="sm"
                                            className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/80 text-[#0f0f0f] font-semibold"
                                        >
                                            <Link
                                                href="/signup"
                                                className="flex items-center justify-center gap-1"
                                            >
                                                Join Free{" "}
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </nav>
        </motion.header>
    );
}
