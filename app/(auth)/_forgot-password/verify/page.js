"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Logo from "@/components/shared/Logo";
import Link from "next/link";
import { ChevronLeft, Loader2, RefreshCw } from "lucide-react";
import ForgotStepIndicator from "@/components/auth/ForgotStepIndicator";

function VerifyOtpContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [timer, setTimer] = useState(60);
    const inputRefs = useRef([]);

    // Mask email for display: ay***@gmail.com
    const maskEmail = (emailStr) => {
        if (!emailStr) return "";
        const [name, domain] = emailStr.split("@");
        if (name.length <= 2) return `${name}***@${domain}`;
        return `${name.substring(0, 2)}***@${domain}`;
    };

    useEffect(() => {
        const countdown = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(countdown);
    }, []);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // Only numbers

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Only take last char
        setOtp(newOtp);

        // Auto-focus next
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleResend = async () => {
        if (timer > 0 || resending) return;

        setResending(true);
        try {
            const res = await fetch("/api/auth/forgot-password/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) throw new Error("Failed to resend OTP");

            toast.success("New OTP sent successfully");
            setTimer(60);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setResending(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpString = otp.join("");
        if (otpString.length !== 6) {
            toast.error("Please enter the full 6-digit code");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/forgot-password/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: otpString }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error?.message || "Invalid OTP");
            }

            toast.success("Identity verified!");
            router.push(
                `/forgot-password/reset?token=${data.resetToken}&email=${encodeURIComponent(email)}`,
            );
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background w-full p-4">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <Logo size="lg" href="/login" />
                    <p className="text-muted-foreground mt-2 text-sm">
                        Security Verification
                    </p>
                </div>

                <Card className="border-border/50 shadow-2xl shadow-primary/5 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                        <ForgotStepIndicator currentStep={2} />
                        <CardTitle className="text-xl">
                            Check your email
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                            We&apos;ve sent a 6-digit code to{" "}
                            <span className="text-foreground font-semibold">
                                {maskEmail(email)}
                            </span>
                            .
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="flex justify-between gap-2 sm:gap-4">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) =>
                                            (inputRefs.current[index] = el)
                                        }
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) =>
                                            handleChange(index, e.target.value)
                                        }
                                        onKeyDown={(e) =>
                                            handleKeyDown(index, e)
                                        }
                                        className="w-11 h-12 sm:w-14 sm:h-16 text-center text-xl font-bold bg-background border-2 border-border/50 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </div>

                            <div className="text-center">
                                {timer > 0 ? (
                                    <p className="text-xs text-muted-foreground">
                                        Resend code in{" "}
                                        <span className="text-foreground font-mono font-bold">
                                            {timer}s
                                        </span>
                                    </p>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={resending}
                                        className="text-xs font-bold text-primary hover:text-primary/80 flex items-center justify-center mx-auto gap-1.5 transition-colors disabled:opacity-50"
                                    >
                                        <RefreshCw
                                            className={`w-3 h-3 ${resending ? "animate-spin" : ""}`}
                                        />
                                        Resend OTP
                                    </button>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full rounded-full h-11 text-sm font-bold shadow-lg shadow-primary/10"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : null}
                                {loading ? "Verifying..." : "Verify & Continue"}
                            </Button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-border/50 text-center">
                            <p className="text-xs text-muted-foreground">
                                Entered the wrong email?{" "}
                                <Link
                                    href="/forgot-password"
                                    className="text-primary font-bold hover:underline"
                                >
                                    Change email
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function VerifyOtpPage() {
    return (
        <Suspense
            fallback={
                <div className="flex flex-col items-center justify-center min-h-screen bg-background w-full p-4">
                    <div className="w-full max-w-md space-y-8">
                        <div className="flex flex-col items-center">
                            <div className="h-16 w-16 bg-accent/50 rounded-xl animate-pulse" />
                            <div className="h-4 w-48 bg-accent/30 rounded mt-2" />
                        </div>
                        <div className="h-[450px] bg-accent/20 rounded-2xl" />
                    </div>
                </div>
            }
        >
            <VerifyOtpContent />
        </Suspense>
    );
}
