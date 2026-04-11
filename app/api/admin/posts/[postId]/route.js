import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Post from "@/models/Post";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { validateObjectId } from "@/utils/validators";
import { logAdminAction } from "@/lib/admin-log";
import { createNotification } from "@/lib/notifications";

export async function DELETE(request, { params }) {
    try {
        await connectDB();
        const currentUser = await getCurrentUser(request);

        if (!currentUser || !isAdmin(currentUser)) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { postId } = await params;

        if (!validateObjectId(postId)) {
            return NextResponse.json(
                { message: "Invalid post ID" },
                { status: 400 },
            );
        }

        const post = await Post.findById(postId);

        if (!post) {
            return NextResponse.json(
                { message: "Post not found" },
                { status: 404 },
            );
        }

        await Post.findByIdAndUpdate(postId, {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: currentUser._id,
        });

        await createNotification({
            recipient: post.author,
            type: "system",
            meta: {
                message:
                    "Your post was removed by an admin for violating platform rules.",
            },
        });

        await logAdminAction({
            adminId: currentUser._id,
            action: "post_delete",
            targetType: "post",
            targetId: postId,
            summary: `Removed post by user ${post.author}`,
        });

        return NextResponse.json({ message: "Post removed successfully" });
    } catch (error) {
        console.error("[AdminDeletePostDELETE] Error:", error.message);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 },
        );
    }
}
