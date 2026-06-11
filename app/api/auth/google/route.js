import { NextResponse } from "next/server";
import config from "@/lib/config";

export async function GET(request) {
    try {
        if (!config.google.clientId) {
            throw new Error("Google Client ID not configured");
        }

        const params = new URLSearchParams({
            client_id: config.google.clientId,
            redirect_uri: config.google.redirectUri,
            response_type: "code",
            scope: "openid email profile",
            access_type: "offline",
            prompt: "select_account",
        });

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

        return NextResponse.redirect(authUrl);
    } catch (error) {
        console.error("Google OAuth initiate error:", error);
        const { origin } = new URL(request.url);
        return NextResponse.redirect(`${origin}/login?error=oauth_init_failed`);
    }
}
