import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { refreshUserProStatus } from "@/lib/subscription";
import { uploadPostImage } from "@/lib/cloudinary";

export async function POST(request) {
    try {
        const currentUser = await getCurrentUser(request);
        if (!currentUser) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 },
            );
        }

        // Check Pro status first!
        const isPro = await refreshUserProStatus(currentUser._id);
        if (!isPro) {
            return NextResponse.json(
                { message: "Pro subscription required for image uploads" },
                { status: 403 },
            );
        }

        const formData = await request.formData();
        const files = formData.getAll("images"); // Accept multiple files!

        if (!files.length) {
            return NextResponse.json(
                { message: "No files uploaded" },
                { status: 400 },
            );
        }

        // Validate files!
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif",
        ];
        const maxFileSize = 8 * 1024 * 1024; // 8MB per file

        const uploadedUrls = [];

        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                return NextResponse.json(
                    { message: `File type not allowed` },
                    { status: 400 },
                );
            }

            if (file.size > maxFileSize) {
                return NextResponse.json(
                    { message: "File must be under 8MB" },
                    { status: 400 },
                );
            }

            // Convert to buffer!
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Upload each to Cloudinary!
            try {
                const url = await uploadPostImage(
                    buffer,
                    currentUser._id.toString(),
                );
                uploadedUrls.push(url);
            } catch (uploadError) {
                console.error("Cloudinary upload error:", uploadError);
                return NextResponse.json(
                    { message: "Upload failed, please try again" },
                    { status: 500 },
                );
            }
        }

        return NextResponse.json({
            message: "Images uploaded successfully",
            uploadedUrls,
        });
    } catch (error) {
        console.error("Post image upload route error:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 },
        );
    }
}
