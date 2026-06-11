import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import PromoCode from "@/models/PromoCode";

export async function PATCH(req, { params }) {
    try {
        await connectDB();
        const user = await getCurrentUser(req);

        if (!user?._id || !isAdmin(user)) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id } = params;
        const { isActive, durationDays, maxUses } = await req.json();

        const promoCode = await PromoCode.findById(id);
        if (!promoCode) {
            return NextResponse.json(
                { error: "Promo code not found" },
                { status: 404 },
            );
        }

        if (isActive !== undefined) promoCode.isActive = isActive;
        if (durationDays !== undefined) promoCode.durationDays = durationDays;
        if (maxUses !== undefined) promoCode.maxUses = maxUses;

        await promoCode.save();
        const populatedCode = await PromoCode.findById(promoCode._id)
            .populate("createdBy", "username")
            .populate("usedBy.userId", "username");

        return NextResponse.json({ promoCode: populatedCode }, { status: 200 });
    } catch (error) {
        console.error("Update promo code error:", error);
        return NextResponse.json(
            { error: "Failed to update promo code" },
            { status: 500 },
        );
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const user = await getCurrentUser(req);

        if (!user?._id || !isAdmin(user)) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id } = params;
        await PromoCode.findByIdAndDelete(id);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Delete promo code error:", error);
        return NextResponse.json(
            { error: "Failed to delete promo code" },
            { status: 500 },
        );
    }
}
