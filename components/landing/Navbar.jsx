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
import {
    Menu,
    X,
    ArrowRight,
    GraduationCap,
    Shield,
    Zap,
    LogOut,
    User,
    Home,
    Book,
    Users2,
    Trophy,
    Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/shared/Logo";
import { AnimatePresence } from "framer-motion";

export default function Navbar() {
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
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

    const mainNavLinks = [
        { href: "/feed", label: "Feed", icon: <Home className="w-4 h-4" /> },
        { href: "/resources", label: "Resources", icon: <Book className="w-4 h-4" /> },
        { href: "/community", label: "Community", icon: <Users2 className="w-4 h-4" /> },
        { href: "/events", label: "Events", icon: <Calendar className="w-4 h-4" /> },
        { href: "/leaderboard", label: "Leaderboard", icon: <Trophy className="w-4 h-4" /> },
    ];

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 py-4 pointer-events-none">
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className={cn(
                    "pointer-events-auto flex items-center justify-between h-14 px-6 rounded-full border transition-all duration-300 w-full max-w-5xl",
                    scrolled
                        ? "bg-neutral-900/80 backdrop-blur-xl border-neutral-800 shadow-xl"
                        : "bg-transparent border-transparent"
                )}
            >
                {/* Logo */}
                <div className="flex shrink-0">
                    <Logo size="md" showText={false} className="md:hidden" href="/" />
                    <Logo size="md" showText={true} className="hidden md:flex" href="/" />
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    {mainNavLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-neutral-400 hover:text-white transition-colors duration-200"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Right Side Actions */}
                <div className="flex items-center gap-3 shrink-0">
                    {mounted && !loading && user ? ( 
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-full hover:bg-white/10 h-9 px-2 gap-2"
                                >
                                    {user.image ? (
                                        <img
                                            src={user.image}
                                            alt={user.name}
                                            className="w-7 h-7 rounded-full"
                                        />
                                    ) : (
                                        <User className="w-5 h-5 text-neutral-400" />
                                    )}
                                    <span className="text-sm text-neutral-200 hidden sm:inline">
                                        {user.name.split(' ')[0]}
                                    </span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 bg-neutral-900 border-neutral-800 p-1 mt-2">
                                <Link href="/profile" className="flex px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-white/5 rounded-md">Profile</Link>
                                <Link href="/settings" className="flex px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-white/5 rounded-md">Settings</Link>
                                <hr className="border-neutral-800 my-1" />
                                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-md">
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </PopoverContent>
                        </Popover>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button asChild variant="ghost" size="sm" className="rounded-full text-neutral-400 hover:text-white h-9 px-4 hidden sm:flex">
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button
                                asChild
                                size="sm"
                                className="rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 h-9 px-5 shadow-lg shadow-primary/20"
                            >
                                <Link href="/signup">Join</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </motion.header>
        </div>
    );
}
