"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Logo from "@/components/shared/Logo";
import Link from "next/link";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    useEffect(() => {
        const oauthError = searchParams.get("error");
        if (oauthError) {
            const errorMessages = {
                oauth_init_failed: "Google sign-in is not configured properly.",
                oauth_cancelled: "Google sign-in was cancelled.",
                missing_code: "Invalid authentication response from Google.",
                oauth_failed: "Google sign-in failed. Please try again.",
            };
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setError(
                errorMessages[oauthError] ||
                    "An error occurred during sign-in.",
            );
        }
    }, [searchParams]);

    const validateField = (name, value) => {
        let error = "";
        if (name === "email") {
            if (!value) error = "Email is required";
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                error = "Invalid email format";
            else if (value.split("@")[0].length < 4)
                error = "Email prefix must be at least 4 characters";
        } else if (name === "password") {
            if (!value) error = "Password is required";
        }
        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (touched[name]) {
            setErrors({ ...errors, [name]: validateField(name, value) });
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched({ ...touched, [name]: true });
        setErrors({ ...errors, [name]: validateField(name, value) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all fields
        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setTouched({ email: true, password: true });
            setError("Please fill in all required fields.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            // Use window.location.href for a full refresh to ensure cookies are
            // correctly picked up by the middleware on the next request.
            // This solves the common "login twice" issue in production.
            window.location.href = "/feed";
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background w-full p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center">
                    <Logo size="lg" href="/login" />
                    <p className="text-muted-foreground mt-2 text-base">
                        Welcome back to your campus hub
                    </p>
                </div>

                <Card className="border-border/50 shadow-xl shadow-primary/5">
                    <CardHeader className="pb-2 text-center">
                        <CardTitle className="text-2xl">Login</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* <GoogleSignInButton /> */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        Verify with your email & password
                                    </span>
                                </div>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={
                                            touched.email && errors.email
                                                ? "border-destructive"
                                                : ""
                                        }
                                        aria-invalid={
                                            !!(touched.email && errors.email)
                                        }
                                        aria-describedby={
                                            touched.email && errors.email
                                                ? "email-error"
                                                : undefined
                                        }
                                        required
                                    />
                                    {touched.email && errors.email && (
                                        <p
                                            id="email-error"
                                            className="text-xs text-destructive mt-1"
                                        >
                                            {errors.email}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">
                                            Password
                                        </Label>
                                    </div>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={
                                            touched.password && errors.password
                                                ? "border-destructive"
                                                : ""
                                        }
                                        aria-invalid={
                                            !!(
                                                touched.password &&
                                                errors.password
                                            )
                                        }
                                        aria-describedby={
                                            touched.password && errors.password
                                                ? "password-error"
                                                : undefined
                                        }
                                        required
                                    />
                                    {touched.password && errors.password && (
                                        <p
                                            id="password-error"
                                            className="text-xs text-destructive mt-1"
                                        >
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {error && (
                                    <Alert variant="destructive">
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>
                                            {error}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full rounded-full h-12 text-base"
                                    disabled={loading}
                                >
                                    {loading ? "Logging in..." : "Log in"}
                                </Button>
                            </form>

                            <div className="mt-6 text-center text-base">
                                <span className="text-muted-foreground">
                                    Don&apos;t have an account?{" "}
                                </span>
                                <Link
                                    href="/signup"
                                    className="text-primary font-semibold hover:underline"
                                >
                                    Sign up
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen bg-background w-full p-4">
                    <div className="w-full max-w-md space-y-8">
                        <div className="flex flex-col items-center">
                            <div className="h-16 w-16 bg-accent/50 rounded-xl animate-pulse" />
                            <div className="h-4 w-48 bg-accent/30 rounded mt-2" />
                        </div>
                        <div className="h-[400px] bg-accent/20 rounded-2xl" />
                    </div>
                </div>
            }
        >
            <LoginContent />
        </Suspense>
    );
}
