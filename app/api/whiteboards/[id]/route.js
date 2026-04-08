import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/db";
import Whiteboard from "@/models/Whiteboard";
import { validateObjectId } from "@/utils/validators";

export async function GET(request, { params }) {
    const { id } = await params;
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        if (!validateObjectId(id)) {
            return NextResponse.json({ error: "Invalid id" }, { status: 400 });
        }

        await connectDB();

        const wb = await Whiteboard.findById(id).lean();
        if (!wb)
            return NextResponse.json({ error: "Not found" }, { status: 404 });

        if (wb.owner.toString() !== currentUser._id.toString()) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Sanitize and ensure proper snapshot structure for tldraw v4
        const rawSnapshot = wb.snapshot || {};

        // Handle conversion from old format (document-based) to new format (schemaVersion/store)
        let sanitizedSnapshot;
        if (rawSnapshot.document && rawSnapshot.document.store) {
            // Old format - convert to new format
            sanitizedSnapshot = {
                schemaVersion: (rawSnapshot.document.schema && rawSnapshot.document.schema.schemaVersion) || 2,
                store: rawSnapshot.document.store || {},
            };
        } else {
            // New format or already correct
            sanitizedSnapshot = {
                schemaVersion: rawSnapshot.schemaVersion || 2,
                store: rawSnapshot.store || {},
                ...rawSnapshot,
            };
        }

        // Remove any undefined values
        const cleanSnapshot = JSON.parse(JSON.stringify(sanitizedSnapshot));
        return NextResponse.json({
            id: wb._id,
            title: wb.title,
            snapshot: cleanSnapshot,
            createdAt: wb.createdAt,
            updatedAt: wb.updatedAt,
        });
    } catch (error) {
        console.error("[Whiteboards/[id] GET]", error.stack || error.message);
        return NextResponse.json(
            { error: "Failed to fetch whiteboard" },
            { status: 500 },
        );
    }
}

export async function DELETE(request, { params }) {
    const { id } = await params;
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        if (!validateObjectId(id)) {
            return NextResponse.json({ error: "Invalid id" }, { status: 400 });
        }

        await connectDB();

        const wb = await Whiteboard.findById(id);
        if (!wb)
            return NextResponse.json({ error: "Not found" }, { status: 404 });

        if (wb.owner.toString() !== currentUser._id.toString()) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await wb.deleteOne();

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error(
            "[Whiteboards/[id] DELETE]",
            error.stack || error.message,
        );
        return NextResponse.json(
            { error: "Failed to delete whiteboard" },
            { status: 500 },
        );
    }
}
