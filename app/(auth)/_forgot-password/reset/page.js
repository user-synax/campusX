"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Logo from "@/components/shared/Logo";
import {
    Eye,
    EyeOff,
    Loader2,
    Check,
    X,
    ShieldCheck,
    Lock,
} from "lucide-react";
import ForgotStepIndicator from "@/components/auth/ForgotStepIndicator";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [passwords, setPasswords] = useState({
        newPassword: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(3);

    const [strength, setStrength] = useState({
        length: false,
        uppercase: false,
        number: false,
    });

    useEffect(() => {
        const pass = passwords.newPassword;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStrength({
            length: pass.length >= 8,
            uppercase: /[A-Z]/.test(pass),
            number: /[0-9]/.test(pass),
        });
    }, [passwords.newPassword]);

    useEffect(() => {
        if (success && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (success && countdown === 0) {
            router.push("/login");
        }
    }, [success, countdown, router]);

    const getStrengthLevel = () => {
        const score = Object.values(strength).filter(Boolean).length;
        if (score === 0)
            return {
                label: "Empty",
                color: "bg-muted",
                text: "text-muted-foreground",
            };
        if (score === 1)
            return { label: "Weak", color: "bg-red-500", text: "text-red-500" };
        if (score === 2)
            return {
                label: "Medium",
                color: "bg-yellow-500",
                text: "text-yellow-500",
            };
        return {
            label: "Strong",
            color: "bg-green-500",
            text: "text-green-500",
        };
    };

    const strLevel = getStrengthLevel();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            toast.error("Invalid reset link");
            return;
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (!strength.length || !strength.uppercase || !strength.number) {
            toast.error("Please meet all password requirements");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/forgot-password/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resetToken: token,
                    newPassword: passwords.newPassword,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error?.message || "Reset failed");
            }

            setSuccess(true);
            toast.success("Password reset successful!");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background w-full p-4">
                <Card className="w-full max-w-md border-green-500/20 bg-green-500/5 backdrop-blur-md text-center p-8">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 ring-4 ring-green-500/10">
                        <Check className="w-8 h-8 stroke-[3]" />
                    </div>
                    <h2 className="text-2xl font-black mb-2">
                        Password Updated!
                    </h2>
                    <p className="text-muted-foreground text-sm mb-8 px-4">
                        Your password has been changed successfully. You can now
                        log in with your new credentials.
                    </p>
                    <div className="bg-background/50 rounded-lg py-3 px-4 inline-block text-xs font-medium text-muted-foreground">
                        Redirecting to login in{" "}
                        <span className="text-foreground font-bold">
                            {countdown}s
                        </span>
                        ...
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background w-full p-4">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <Logo size="lg" href="/login" />
                    <p className="text-muted-foreground mt-2 text-sm">
                        Secure your account
                    </p>
                </div>

                <Card className="border-border/50 shadow-2xl shadow-primary/5 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                        <ForgotStepIndicator currentStep={3} />
                        <CardTitle className="text-xl">
                            Set New Password
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                            Choose a strong password to ensure your account
                            remains secure.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">
                                    New Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="newPassword"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        value={passwords.newPassword}
                                        onChange={(e) =>
                                            setPasswords({
                                                ...passwords,
                                                newPassword: e.target.value,
                                            })
                                        }
                                        className="pl-10 pr-10 h-11 bg-background/50 transition-all focus:ring-4 focus:ring-primary/10"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">
                                    Confirm Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        value={passwords.confirmPassword}
                                        onChange={(e) =>
                                            setPasswords({
                                                ...passwords,
                                                confirmPassword: e.target.value,
                                            })
                                        }
                                        className={`pl-10 h-11 bg-background/50 transition-all focus:ring-4 focus:ring-primary/10 ${
                                            passwords.confirmPassword &&
                                            passwords.newPassword !==
                                                passwords.confirmPassword
                                                ? "border-red-500/50"
                                                : ""
                                        }`}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Strength Indicator */}
                            <div className="space-y-2 pt-2">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                        Strength
                                    </span>
                                    <span
                                        className={`text-[10px] font-bold uppercase ${strLevel.text}`}
                                    >
                                        {strLevel.label}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex gap-1">
                                    <div
                                        className={`h-full flex-1 transition-all duration-500 ${strength.length || strength.uppercase || strength.number ? strLevel.color : "bg-muted"}`}
                                    />
                                    <div
                                        className={`h-full flex-1 transition-all duration-500 ${(strength.length && strength.uppercase) || (strength.length && strength.number) || (strength.uppercase && strength.number) ? strLevel.color : "bg-muted"}`}
                                    />
                                    <div
                                        className={`h-full flex-1 transition-all duration-500 ${strength.length && strength.uppercase && strength.number ? strLevel.color : "bg-muted"}`}
                                    />
                                </div>
                            </div>

                            {/* Checklist */}
                            <div className="grid grid-cols-1 gap-2 p-3 rounded-xl bg-accent/20 border border-border/50">
                                <Requirement
                                    met={strength.length}
                                    label="Min 8 characters"
                                />
                                <Requirement
                                    met={strength.uppercase}
                                    label="At least 1 uppercase"
                                />
                                <Requirement
                                    met={strength.number}
                                    label="At least 1 number"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full rounded-full h-11 text-sm font-bold shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <ShieldCheck className="w-4 h-4 mr-2" />
                                )}
                                {loading ? "Updating..." : "Reset Password"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function Requirement({ met, label }) {
    return (
        <div className="flex items-center gap-2">
            {met ? (
                <Check className="w-3.5 h-3.5 text-green-500 bg-green-500/20 rounded-full p-0.5" />
            ) : (
                <X className="w-3.5 h-3.5 text-muted-foreground/50 bg-muted rounded-full p-0.5" />
            )}
            <span
                className={`text-xs ${met ? "text-foreground font-medium" : "text-muted-foreground"}`}
            >
                {label}
            </span>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="flex flex-col items-center justify-center min-h-screen bg-background w-full p-4">
                    <div className="w-full max-w-md space-y-8">
                        <div className="flex flex-col items-center">
                            <div className="h-16 w-16 bg-accent/50 rounded-xl animate-pulse" />
                            <div className="h-4 w-48 bg-accent/30 rounded mt-2" />
                        </div>
                        <div className="h-[500px] bg-accent/20 rounded-2xl" />
                    </div>
                </div>
            }
        >
            <ResetPasswordContent />
        </Suspense>
    );
}
