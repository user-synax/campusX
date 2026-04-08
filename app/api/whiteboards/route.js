import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/db";
import Whiteboard from "@/models/Whiteboard";
import { sanitizeString } from "@/utils/validators";

export async function GET(request) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        await connectDB();

        // Get or create the user's single whiteboard
        let whiteboard = await Whiteboard.findOne({ owner: currentUser._id }).lean();

        if (!whiteboard) {
            // Create a default empty whiteboard with proper tldraw v4 structure
            const defaultSnapshot = {
                schemaVersion: 2,
                store: {}
            };

            whiteboard = await Whiteboard.create({
                owner: currentUser._id,
                title: "My Whiteboard",
                snapshot: defaultSnapshot,
            });
        }

        // Sanitize and ensure proper snapshot structure for tldraw v4
        const rawSnapshot = whiteboard.snapshot || {};

        // Handle conversion from old format (document-based) to new format (schemaVersion/store)
        let sanitizedSnapshot;
        if (rawSnapshot.document && rawSnapshot.document.store) {
            // Old format - convert to new format
            sanitizedSnapshot = {
                schemaVersion: (rawSnapshot.document.schema && rawSnapshot.document.schema.schemaVersion) || 2,
                store: rawSnapshot.document.store || {},
                ...(rawSnapshot.session ? { session: rawSnapshot.session } : {}),
            };
        } else {
            // New format or already correct
            sanitizedSnapshot = {
                schemaVersion: rawSnapshot.schemaVersion || 2,
                store: rawSnapshot.store || {},
                ...rawSnapshot
            };
        }

        // Remove any undefined values
        const cleanSnapshot = JSON.parse(JSON.stringify(sanitizedSnapshot));

        return NextResponse.json({
            id: String(whiteboard._id),
            title: whiteboard.title,
            snapshot: cleanSnapshot,
            createdAt: whiteboard.createdAt,
            updatedAt: whiteboard.updatedAt,
        });
    } catch (error) {
        console.error("[Whiteboards GET]", error.stack || error.message);
        return NextResponse.json(
            { error: "Failed to fetch whiteboard" },
            { status: 500 },
        );
    }
}

export async function POST(request) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const body = await request.json();
        const snapshot = body.snapshot || {};

        // Ensure snapshot has proper tldraw v4 structure
        const sanitizedSnapshot = {
            schemaVersion: snapshot.schemaVersion || 2,
            store: snapshot.store || {},
            ...snapshot
        };
        const cleanSnapshot = JSON.parse(JSON.stringify(sanitizedSnapshot));

        await connectDB();

        // Get or create the user's single whiteboard
        let whiteboard = await Whiteboard.findOne({ owner: currentUser._id });

        if (whiteboard) {
            // Update existing whiteboard
            whiteboard.snapshot = snapshot;
            whiteboard.updatedAt = new Date();
            await whiteboard.save();
        } else {
            // Create new whiteboard
            whiteboard = await Whiteboard.create({
                owner: currentUser._id,
                title: "My Whiteboard",
                snapshot,
            });
        }

        return NextResponse.json({
            id: String(whiteboard._id),
            title: whiteboard.title,
            createdAt: whiteboard.createdAt,
            updatedAt: whiteboard.updatedAt,
        });
    } catch (error) {
        console.error("[Whiteboards POST]", error.stack || error.message);
        return NextResponse.json(
            { error: "Failed to save whiteboard" },
            { status: 500 },
        );
    }
}
