import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import BlockedContentAttempt from "@/models/BlockedContentAttempt";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";

export async function GET(request) {
    try {
        await connectDB();
        const currentUser = await getCurrentUser(request);

        if (!currentUser || !isAdmin(currentUser)) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 },
            );
        }

        const blockedAttempts = await BlockedContentAttempt.find({})
            .populate("userId", "name username avatar email")
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        return NextResponse.json({ attempts: blockedAttempts });
    } catch (error) {
        console.error("[Admin Blocked Content Error]:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 },
        );
    }
}

export async function PATCH(request) {
    try {
        await connectDB();
        const currentUser = await getCurrentUser(request);

        if (!currentUser || !isAdmin(currentUser)) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 },
            );
        }

        const body = await request.json();
        const { attemptId, status } = body;

        if (
            !["pending", "reviewed", "dismissed", "actioned"].includes(status)
        ) {
            return NextResponse.json(
                { error: "Invalid status" },
                { status: 400 },
            );
        }

        await BlockedContentAttempt.findByIdAndUpdate(
            attemptId,
            { status },
            { new: true },
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Admin Blocked Content Error]:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 },
        );
    }
}
