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

        // Redirect back to calendar page
        const response = NextResponse.redirect(new URL('/calendar', request.url))

        // Mocking token storage via cookie for the demo
        response.cookies.set('google_calendar_tokens', JSON.stringify(tokens), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        })

        return response
    } catch (error) {
        console.error('Error exchanging code for tokens:', error)
        return NextResponse.json({ error: 'Failed to exchange code' }, { status: 500 })
    }
}
