import { getTokens } from "@/lib/google-auth"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
        return NextResponse.json({ error: 'No code provided' }, { status: 400 })
    }

    try {
        const tokens = await getTokens(code)

        // In a real app, we would save these tokens to the database for the user
        // For this demo, we will log them and maybe set a cookie (not secure for prod)
        console.log('Google Auth Tokens:', tokens)

        // Redirect back to sync page (most relevant now)
        const response = NextResponse.redirect(new URL('/sync-sheets', request.url))

        // Save generic tokens that include both calendar and sheet permissions
        response.cookies.set('google_tokens', JSON.stringify(tokens), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 30 // 30 days
        })

        return response
    } catch (error) {
        console.error('Error exchanging code for tokens:', error)
        return NextResponse.json({ error: 'Failed to exchange code' }, { status: 500 })
    }
}
