import mongoose from "mongoose";

const blockedContentAttemptSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        detectedViolations: {
            type: [String],
            required: true,
        },
        community: {
            type: String,
        },
        status: {
            type: String,
            enum: ["pending", "reviewed", "dismissed", "actioned"],
            default: "pending",
        },
        images: [String],
        tags: [String],
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true },
);

blockedContentAttemptSchema.index({ userId: 1, createdAt: -1 });
blockedContentAttemptSchema.index({ status: 1, createdAt: -1 });

const BlockedContentAttempt =
    mongoose.models.BlockedContentAttempt ||
    mongoose.model("BlockedContentAttempt", blockedContentAttemptSchema);

export default BlockedContentAttempt;
