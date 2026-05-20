"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/user/UserAvatar";
import { Trash2, MoreHorizontal, Reply, SmilePlus, Heart } from "lucide-react";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { renderContentWithMentions, extractUrls } from "@/utils/hashtags";
import UserMention from "@/components/shared/UserMention";
import LinkPreview from "@/components/shared/LinkPreview";
import FormattedTime from "@/components/shared/FormattedTime";
import { Trash, } from "lucide-react";
export default function MessageBubble({
    message,
    isOwn,
    showAvatar,
    currentUserId,
    onDelete,
    onReact,
    onReply,
}) {
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!showMenu) return;
        const handleClose = () => setShowMenu(false);
        window.addEventListener("click", handleClose);
        return () => window.removeEventListener("click", handleClose);
    }, [showMenu]);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await onDelete(message._id);
            setShowDeleteModal(false);
        } finally {
            setDeleting(false);
        }
    };

    const urls = message.content ? extractUrls(message.content) : [];

    // SYSTEM MESSAGE
    if (message.type === "system") {
        return (
            <div className="text-center my-2">
                <span className="text-[11px] text-white bg-blue-500 px-3 py-1 rounded-full">
                    {message.content}
                </span>
            </div>
        );
    }

    // DELETED MESSAGE
    if (message.isDeleted) {
        return (
            <div
                className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1`}
            >
                <div
                    className="italic text-xs text-muted-foreground px-3 py-1.5 rounded-xl 
                        border border-border/50 flex gap-2"
                >
                    <Trash size={12} aria-description="This message was deleted" /> Message deleted
                </div>
            </div>
        );
    }

    return (
        <div
            id={`msg-${message._id}`}
            className={`flex items-end gap-2 mb-1 ${isOwn ? "flex-row-reverse" : "flex-row"} group relative 
                  ${message.isOptimistic ? "opacity-70" : "opacity-100"} transition-all duration-300 rounded-lg p-1`}
        >
            {/* Avatar — show for other people only */}
            {!isOwn && (
                <div className="shrink-0 mb-1">
                    {showAvatar ? (
                        <Link href={`/profile/${message.sender?.username}`}>
                            <UserAvatar user={message.sender} size="xs" />
                        </Link>
                    ) : (
                        <div className="w-6" /> // spacer
                    )}
                </div>
            )}

            <div
                className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}
            >
                {/* Sender name — show only for others, only if showAvatar */}
                {!isOwn && showAvatar && (
                    <p className="text-[10px] text-muted-foreground mb-1 px-1">
                        {message.sender?.name}
                    </p>
                )}

                {/* Message bubble */}
                <div
                    className={cn(
                        "relative px-3 py-2 rounded-2xl text-sm leading-relaxed",
                        isOwn
                            ? "bg-linear-to-br from-[#7130f3] to-[#5b1fd0] text-white text-md rounded-br-md"
                            : "bg-card border border-border text-md rounded-bl-md",
                    )}
                >
                    {/* Replying-to Preview inside bubble */}
                    {message.replyTo && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                const element = document.getElementById(
                                    `msg-${message.replyTo._id}`,
                                );
                                if (element) {
                                    element.scrollIntoView({
                                        behavior: "smooth",
                                        block: "center",
                                    });
                                    element.classList.add("bg-primary/20");
                                    setTimeout(
                                        () =>
                                            element.classList.remove(
                                                "bg-primary/20",
                                            ),
                                        2000,
                                    );
                                }
                            }}
                            className={cn(
                                "mb-2 p-1.5 rounded-lg text-left border-l-2 cursor-pointer transition-colors text-xs select-none min-w-[120px] max-w-full",
                                isOwn
                                    ? "bg-primary-foreground/10 border-primary-foreground/30 hover:bg-primary-foreground/20 text-white"
                                    : "bg-accent/80 border-primary hover:bg-accent text-foreground",
                            )}
                        >
                            <p
                                className={cn(
                                    "font-bold text-[10px] truncate mb-0.5",
                                    isOwn
                                        ? "text-primary-foreground/90"
                                        : "text-primary",
                                )}
                            >
                                {message.replyTo.sender?.name || "User"}
                            </p>
                            <p
                                className={cn(
                                    "truncate text-[11px] opacity-80",
                                    isOwn
                                        ? "text-primary-foreground/80"
                                        : "text-muted-foreground",
                                )}
                            >
                                {message.replyTo.content ||
                                    (message.replyTo.type === "image"
                                        ? "📷 Image"
                                        : "Message")}
                            </p>
                        </div>
                    )}
                    {/* Image message */}
                    {message.type === "image" && message.imageUrl && (
                        <div className="mb-1 rounded-xl overflow-hidden">
                            <img
                                src={message.imageUrl}
                                alt="Shared"
                                className="max-w-full max-h-60 object-cover cursor-pointer"
                                onClick={() =>
                                    window.open(message.imageUrl, "_blank")
                                }
                                loading="lazy"
                            />
                        </div>
                    )}

                    {/* Text content */}
                    {message.content && (
                        <div className="whitespace-pre-wrap break-words">
                            {renderContentWithMentions(message.content).map(
                                (segment, i) => {
                                    if (segment.type === "hashtag") {
                                        return (
                                            <Link
                                                key={i}
                                                href={`/hashtag/${segment.value}`}
                                                className="text-blue-400 hover:text-blue-300 hover:underline"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                #{segment.value}
                                            </Link>
                                        );
                                    } else if (segment.type === "mention") {
                                        return (
                                            <UserMention
                                                key={i}
                                                username={segment.value}
                                            />
                                        );
                                    } else if (segment.type === "url") {
                                        return (
                                            <a
                                                key={i}
                                                href={segment.value}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`${isOwn ? "text-white" : "text-primary"} hover:underline underline-offset-2 opacity-90`}
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                {segment.value}
                                            </a>
                                        );
                                    } else {
                                        return (
                                            <span key={i}>{segment.value}</span>
                                        );
                                    }
                                },
                            )}
                        </div>
                    )}

                    {/* Chat Link Preview */}
                    {urls.length > 0 && (
                        <div className="mt-2 space-y-2">
                            {urls.map((url, i) => (
                                <LinkPreview key={i} url={url} />
                            ))}
                        </div>
                    )}

                    {/* Timestamp */}
                    <div className="flex items-center gap-1 mt-1">
                        <FormattedTime
                            date={message.createdAt}
                            type="time"
                            className={`text-[10px] ${isOwn ? "text-gray-300" : "text-muted-foreground"}`}
                        />
                        {isOwn && message.isOptimistic && (
                            <span className="text-[8px] animate-pulse text-primary-foreground/40">
                                sending...
                            </span>
                        )}
                    </div>
                </div>

                {/* Reactions */}
                {message.reactions?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 px-1">
                        {Object.entries(
                            message.reactions.reduce((acc, r) => {
                                acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                return acc;
                            }, {}),
                        ).map(([emoji, count]) => (
                            <button
                                key={emoji}
                                onClick={() => onReact(message._id, emoji)}
                                className="flex items-center gap-0.5 bg-accent border border-border 
                           rounded-full px-2 py-0.5 text-xs hover:bg-accent/80"
                            >
                                <span>{emoji}</span>
                                <span className="text-muted-foreground">
                                    {count}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Action buttons — visible on hover (Desktop) and always (Mobile) */}
            <div
                className={`flex flex-row md:flex-col gap-1 items-center ${isOwn ? "mr-1" : "ml-1"} 
                       md:opacity-0 md:group-hover:opacity-100 transition-opacity`}
            >
                {/* React */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowReactionPicker(!showReactionPicker);
                    }}
                    className="w-7 h-7 rounded-full bg-accent/50 border border-border 
                     flex items-center justify-center hover:bg-accent active:scale-90 transition-transform"
                >
                    <SmilePlus size={14} />
                </button>

                {/* 3-Dot Options Dropdown */}
                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="w-7 h-7 rounded-full bg-accent/50 border border-border 
                       flex items-center justify-center hover:bg-accent active:scale-90 transition-transform"
                    >
                        <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>

                    {showMenu && (
                        <div
                            className={`absolute bottom-full ${isOwn ? "right-0" : "left-0"} mb-1 w-28 bg-card border border-border rounded-xl shadow-lg z-20 py-1 overflow-hidden animate-in fade-in slide-in-from-bottom-1 duration-150`}
                        >
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onReply(message);
                                    setShowMenu(false);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent flex items-center gap-1.5 font-medium transition-colors"
                            >
                                <Reply className="w-3 h-3 text-muted-foreground" />
                                Reply
                            </button>
                            {isOwn && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowDeleteModal(true);
                                        setShowMenu(false);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-destructive/10 text-destructive flex items-center gap-1.5 font-medium transition-colors"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Reaction picker */}
            {showReactionPicker && (
                <div
                    className={`absolute bottom-full mb-1 bg-card border border-border 
                        rounded-full px-2 py-1 flex gap-1 shadow-lg z-10 ${isOwn ? "right-0" : "left-0"}`}
                >
                    {[<Heart size={18} fill="red" strokeWidth={0} />, "😂", "👍", "🔥", "😮", "😢", "🥀"].map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => {
                                onReact(message._id, emoji);
                                setShowReactionPicker(false);
                            }}
                            className="text-lg hover:scale-125 transition-transform"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmDeleteModal
                isOpen={showDeleteModal}
                onClose={() => !deleting && setShowDeleteModal(false)}
                onConfirm={handleDelete}
                loading={deleting}
            />
        </div>
    );
}
