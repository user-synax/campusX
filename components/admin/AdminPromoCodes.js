"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    Loader2,
    Plus,
    Trash2,
    Copy,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const PRESETS = [
    { label: "Weekly (7 days)", value: 7 },
    { label: "Monthly (30 days)", value: 30 },
    { label: "Quarterly (90 days)", value: 90 },
    { label: "Annually (365 days)", value: 365 },
];

export default function AdminPromoCodes() {
    const [loading, setLoading] = useState(true);
    const [promoCodes, setPromoCodes] = useState([]);
    const [creating, setCreating] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState("30");
    const [customDays, setCustomDays] = useState("");
    const [maxUses, setMaxUses] = useState("1");

    useEffect(() => {
        // eslint-disable-next-line react-hooks/immutability
        fetchPromoCodes();
    }, []);

    const fetchPromoCodes = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/promocodes");
            const data = await res.json();
            setPromoCodes(data.promoCodes || []);
        } catch (error) {
            console.error("Failed to fetch promo codes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            setCreating(true);
            const durationDays = customDays
                ? parseInt(customDays)
                : parseInt(selectedPreset);
            if (!durationDays || durationDays < 1) {
                toast.error("Invalid duration");
                return;
            }

            const res = await fetch("/api/admin/promocodes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    durationDays,
                    maxUses: parseInt(maxUses),
                }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            toast.success("Promo code created!");
            setCustomDays("");
            fetchPromoCodes();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setCreating(false);
        }
    };

    const handleToggleActive = async (id, currentActive) => {
        try {
            const res = await fetch(`/api/admin/promocodes/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentActive }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            fetchPromoCodes();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this promo code?"))
            return;

        try {
            const res = await fetch(`/api/admin/promocodes/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");

            toast.success("Promo code deleted");
            fetchPromoCodes();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleCopy = async (code) => {
        try {
            await navigator.clipboard.writeText(code);
            toast.success("Code copied!");
        } catch (error) {
            toast.error("Failed to copy");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6">
            {/* Create Promo Code */}
            <Card className="bg-accent/20 border-border/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        Create Promo Code
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">
                                Duration
                            </label>
                            <Select
                                value={customDays ? "custom" : selectedPreset}
                                onValueChange={(v) => {
                                    if (v !== "custom") {
                                        setSelectedPreset(v);
                                        setCustomDays("");
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PRESETS.map((p) => (
                                        <SelectItem
                                            key={p.value}
                                            value={String(p.value)}
                                        >
                                            {p.label}
                                        </SelectItem>
                                    ))}
                                    <SelectItem value="custom">
                                        Custom...
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {customDays !== "" && (
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">
                                    Custom Days
                                </label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={customDays}
                                    onChange={(e) =>
                                        setCustomDays(e.target.value)
                                    }
                                    placeholder="Number of days"
                                />
                            </div>
                        )}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">
                                Max Uses
                            </label>
                            <Input
                                type="number"
                                min="1"
                                value={maxUses}
                                onChange={(e) => setMaxUses(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button
                        onClick={handleCreate}
                        disabled={creating}
                        className="gap-2"
                    >
                        {creating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4" />
                        )}
                        Create Code
                    </Button>
                </CardContent>
            </Card>

            {/* List */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    All Codes
                </h3>
                {promoCodes.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-8">
                        No promo codes yet
                    </div>
                ) : (
                    <div className="space-y-2">
                        {promoCodes.map((code) => (
                            <Card
                                key={code._id}
                                className="bg-accent/10 border-border/50"
                            >
                                <CardContent className="p-4 flex flex-wrap items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-lg">
                                                {code.code}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleCopy(code.code)
                                                }
                                            >
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {code.durationDays} days ·{" "}
                                            {code.useCount}/{code.maxUses} uses
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Created{" "}
                                            {formatDistanceToNow(
                                                new Date(code.createdAt),
                                                { addSuffix: true },
                                            )}{" "}
                                            by @{code.createdBy?.username}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-2">
                                            {code.isActive ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-red-500" />
                                            )}
                                            <Switch
                                                checked={code.isActive}
                                                onCheckedChange={() =>
                                                    handleToggleActive(
                                                        code._id,
                                                        code.isActive,
                                                    )
                                                }
                                            />
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={() =>
                                                handleDelete(code._id)
                                            }
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
