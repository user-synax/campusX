import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Subscription from "@/models/Subscription";

export async function GET(req) {
    try {
        await connectDB();
        const user = await getCurrentUser(req);

        if (!user?._id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const subscription = await Subscription.findOne({ userId: user._id });

        return NextResponse.json({ subscription }, { status: 200 });
    } catch (error) {
        console.error("Get subscription error:", error);
        return NextResponse.json(
            { error: "Failed to get subscription" },
            { status: 500 },
        );
    }
}
