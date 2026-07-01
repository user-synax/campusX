import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import BlockedContentAttempt from "@/models/BlockedContentAttempt";
import { checkContentModeration } from "@/utils/contentModeration";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request) {
    try {
        await connectDB();
        const currentUser = await getCurrentUser(request);

        if (!currentUser) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const body = await request.json();
        const { content, community, images, tags } = body;

        const moderationResult = checkContentModeration(content);

        if (moderationResult.isBlocked) {
            // Log the blocked attempt
            await BlockedContentAttempt.create({
                userId: currentUser._id,
                content,
                community,
                images: images || [],
                tags: tags || [],
                detectedViolations: moderationResult.violations,
                status: "pending",
            });
        }

        return NextResponse.json(moderationResult);
    } catch (error) {
        console.error("[Moderation Check Error]:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 },
        );
    }
}
