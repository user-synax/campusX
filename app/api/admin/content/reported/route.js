import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Post from "@/models/Post";
import Report from "@/models/Report";
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

        // Step 1: Find all pending reports
        const allPendingReports = await Report.find({ status: "pending" })
            .sort({ createdAt: -1 })
            .lean();

        if (allPendingReports.length === 0) {
            return NextResponse.json({ posts: [] });
        }

        // Step 2: Group reports by postId to count pending reports per post
        const reportCounts = {};
        const postIds = [];
        for (const report of allPendingReports) {
            const id = report.postId.toString();
            if (!reportCounts[id]) {
                reportCounts[id] = 0;
                postIds.push(report.postId);
            }
            reportCounts[id]++;
        }

        // Step 3: Fetch all unique posts, even if deleted, then filter
        let posts = await Post.find({
            _id: { $in: postIds },
        })
            .populate("author", "name username college avatar isVerified")
            .lean();

        // Filter out deleted posts
        posts = posts.filter((p) => !p.isDeleted);

        // Step 4: Add reportCount to each post and sort
        posts = posts.map((post) => ({
            ...post,
            reportCount: reportCounts[post._id.toString()],
        }));

        // Step 5: Sort by report count descending, then date descending
        posts.sort((a, b) => {
            if (b.reportCount !== a.reportCount) {
                return b.reportCount - a.reportCount;
            }
            return b.createdAt - a.createdAt;
        });

        // Step 6: Limit to 50
        posts = posts.slice(0, 50);

        return NextResponse.json({ posts });
    } catch (error) {
        console.error("[AdminContentReportedGET] Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 },
        );
    }
}
