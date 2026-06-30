import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import PushSubscription from "@/models/PushSubscription";
import { getCurrentUser } from "@/lib/auth";

// Subscribe user
export async function POST(request) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser)
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );

        await connectDB();
        const { subscription } = await request.json();

        // Update or create subscription
        await PushSubscription.findOneAndUpdate(
            { endpoint: subscription.endpoint },
            {
                userId: currentUser._id,
                endpoint: subscription.endpoint,
                keys: subscription.keys,
                userAgent: request.headers.get("user-agent"),
                lastActive: new Date(),
            },
            { upsert: true, new: true },
        );

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[Subscribe]", err.message);
        return NextResponse.json(
            { error: "Failed to save subscription" },
            { status: 500 },
        );
    }
}

// Unsubscribe user
export async function DELETE(request) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser)
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );

        await connectDB();
        const { subscription } = await request.json();

        if (subscription?.endpoint) {
            await PushSubscription.deleteOne({
                endpoint: subscription.endpoint,
                userId: currentUser._id,
            });
        } else {
            await PushSubscription.deleteMany({ userId: currentUser._id });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[Unsubscribe]", err.message);
        return NextResponse.json(
            { error: "Failed to delete subscription" },
            { status: 500 },
        );
    }
}
