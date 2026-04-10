"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  ShieldCheck,
  Upload,
  FileImage,
  X,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import useUser from "@/hooks/useUser"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_EXTENSIONS = "JPG, PNG, WebP, PDF"

export default function VerifyStudentPage() {
  const router = useRouter()
  const { user, loading: userLoading, refetch } = useUser()
  const fileInputRef = useRef(null)

  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // ── File selection handler ──
  const handleFileSelect = useCallback((selectedFile) => {
    if (!selectedFile) return

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      toast.error(`Invalid file type. Accepted: ${ALLOWED_EXTENSIONS}`)
      return
    }

    if (selectedFile.size > MAX_SIZE) {
      toast.error("File too large. Maximum size is 5 MB.")
      return
    }

    setFile(selectedFile)

    // Generate preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(selectedFile)
    } else {
      // PDF — show generic icon
      setPreview(null)
    }
  }, [])

  const handleInputChange = (e) => {
    handleFileSelect(e.target.files?.[0])
  }

  // ── Drag & Drop ──
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFileSelect(e.dataTransfer.files?.[0])
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // ── Submit ──
  const handleSubmit = async () => {
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("idCard", file)

      const res = await fetch("/api/user/submit-verification", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error?.message || "Submission failed")
      }

      setSubmitted(true)
      refetch()
      toast.success("Verification submitted!")
    } catch (err) {
      toast.error(err.message)
    } finally {
      setUploading(false)
    }
  }

  // ── Loading state ──
  if (userLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  // ── Already verified ──
  if (user?.isVerified && user?.verificationStatus === "verified") {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] bg-background max-w-2xl mx-auto w-full">
        <Header onBack={() => router.back()} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          <div className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #22c55e20, #16a34a30)" }}>
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">You&apos;re already verified!</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Your student status has been confirmed. You have the{" "}
              <span className="text-green-400 font-semibold">✓ Verified Student</span> badge.
            </p>
          </div>
          <Button variant="outline" className="rounded-xl mt-2" onClick={() => router.push(`/profile/${user.username}`)}>
            View Profile
          </Button>
        </div>
      </div>
    )
  }

  // ── Pending review ──
  if (user?.verificationStatus === "pending") {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] bg-background max-w-2xl mx-auto w-full">
        <Header onBack={() => router.back()} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          <div className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #facc1520, #eab30830)" }}>
            <Clock className="w-10 h-10 text-yellow-500" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">Verification Under Review</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              We&apos;re reviewing your college ID. You&apos;ll be notified within{" "}
              <strong className="text-foreground/80">24 hours</strong>.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
            style={{ background: "#facc1515", color: "#facc15", border: "1px solid #facc1530" }}>
            <Clock className="w-3.5 h-3.5" />
            Pending Review
          </div>
        </div>
      </div>
    )
  }

  // ── Success screen (just submitted) ──
  if (submitted) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] bg-background max-w-2xl mx-auto w-full">
        <Header onBack={() => router.back()} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
          <div className="relative">
            <div className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #22c55e15, #16a34a25)" }}>
              <ShieldCheck className="w-12 h-12 text-green-500" />
            </div>
            {/* pulse ring */}
            <div className="absolute inset-0 rounded-full animate-ping opacity-20"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }} />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">ID Submitted Successfully! 🎉</h2>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Your college ID is under review. We&apos;ll notify you within{" "}
              <strong className="text-foreground/80">24 hours</strong> once it&apos;s verified.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
            style={{ background: "#facc1515", color: "#facc15", border: "1px solid #facc1530" }}>
            <Clock className="w-3.5 h-3.5" />
            Under Review
          </div>
          <Button variant="outline" className="rounded-xl mt-4" onClick={() => router.push("/feed")}>
            Back to Feed
          </Button>
        </div>
      </div>
    )
  }

  // ── Main upload form ──
  const isRejected = user?.verificationStatus === "rejected"

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background max-w-2xl mx-auto w-full">
      <Header onBack={() => router.back()} />

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">

        {/* Rejected reason banner */}
        {isRejected && user?.verificationRejectedReason && (
          <div className="flex items-start gap-3 p-4 rounded-2xl border"
            style={{ background: "#ef444410", borderColor: "#ef444430" }}>
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-400 mb-1">
                Previous submission rejected
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {user.verificationRejectedReason}
              </p>
            </div>
          </div>
        )}

        {/* Info card */}
        <div className="rounded-2xl border border-border p-5"
          style={{ background: "linear-gradient(135deg, #22c55e06, #10b98108)" }}>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "#22c55e15" }}>
              <ShieldCheck className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {isRejected ? "Resubmit Verification" : "Verify Your Student Status"}
              </h2>
              <p className="text-xs text-muted-foreground">Upload your college ID card</p>
            </div>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground pl-[46px]">
            <p>• <strong className="text-foreground/70">Front side</strong> of your college ID card</p>
            <p>• Make sure your name and college are <strong className="text-foreground/70">clearly visible</strong></p>
            <p>• Accepted: {ALLOWED_EXTENSIONS} — Max 5 MB</p>
            <p>• Usually reviewed within <strong className="text-foreground/70">24 hours</strong></p>
          </div>
        </div>

        {/* Upload area */}
        <div
          className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer group ${
            dragActive
              ? "border-green-500/50 bg-green-500/5"
              : file
              ? "border-green-500/30 bg-green-500/5"
              : "border-border hover:border-muted-foreground/30 hover:bg-accent/30"
          }`}
          style={{ minHeight: "220px" }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            className="hidden"
            onChange={handleInputChange}
          />

          {file ? (
            // ── File preview ──
            <div className="flex flex-col items-center justify-center p-6 gap-4">
              {preview ? (
                <div className="relative w-full max-w-xs aspect-video">
                  <Image
                    src={preview}
                    alt="ID Preview"
                    fill
                    unoptimized
                    className="rounded-xl border border-border shadow-lg object-contain bg-black/30"
                  />
                </div>
              ) : (
                // PDF file
                <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
                  <FileImage className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-sm font-semibold text-foreground truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); clearFile() }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg bg-card border border-border hover:border-red-500/30"
                >
                  <X className="w-3.5 h-3.5" /> Remove
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg bg-card border border-border"
                >
                  <Upload className="w-3.5 h-3.5" /> Change File
                </button>
              </div>
            </div>
          ) : (
            // ── Empty upload area ──
            <div className="flex flex-col items-center justify-center p-8 gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-accent/50 group-hover:bg-accent transition-colors">
                <ImageIcon className="w-7 h-7 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground mb-1">
                  {dragActive ? "Drop your ID here" : "Upload College ID Card"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Drag & drop or <span className="text-green-400 underline underline-offset-2">browse files</span>
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                {ALLOWED_EXTENSIONS} • Max 5 MB
              </p>
            </div>
          )}
        </div>

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          disabled={!file || uploading}
          className="w-full h-12 rounded-2xl font-bold text-sm transition-all duration-200 disabled:opacity-40"
          style={{
            background: file && !uploading
              ? "linear-gradient(135deg, #22c55e, #16a34a)"
              : undefined,
            color: file && !uploading ? "#fff" : undefined,
            boxShadow: file && !uploading ? "0 4px 14px #22c55e30" : undefined,
          }}
        >
          {uploading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Submit for Verification
            </span>
          )}
        </Button>

        {/* Privacy note */}
        <p className="text-center text-[10px] text-muted-foreground/50 pb-6 leading-relaxed">
          Your ID card is stored securely and used only for verification purposes.
          <br />It will not be shared publicly or with other users.
        </p>
      </div>
    </div>
  )
}

function Header({ onBack }) {
  return (
    <div className="sticky top-0 bg-background/80 backdrop-blur border-b border-border z-10">
      <div className="flex items-center gap-3 px-4 py-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-green-500" />
          <h1 className="text-xl font-bold">Student Verification</h1>
        </div>
      </div>
    </div>
  )
}
