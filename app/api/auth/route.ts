import { Errors, createClient } from "@farcaster/quick-auth";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const client = createClient();

// Backend API URL
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000/api";

// Helper function to determine the correct domain for JWT verification
function getUrlHost(request: NextRequest): string {
  // First try to get the origin from the Origin header (most reliable for CORS requests)
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const url = new URL(origin);
      return url.host;
    } catch (error) {
      console.warn("Invalid origin header:", origin, error);
    }
  }

  // Fallback to Host header
  const host = request.headers.get("host");
  if (host) {
    return host;
  }

  // Final fallback to environment variables (your original logic)
  let urlValue: string;
  if (process.env.VERCEL_ENV === "production") {
    urlValue = process.env.NEXT_PUBLIC_URL!;
  } else if (process.env.VERCEL_URL) {
    urlValue = `https://${process.env.VERCEL_URL}`;
  } else {
    urlValue = "http://localhost:3000";
  }

  const url = new URL(urlValue);
  return url.host;
}

export async function GET(request: NextRequest) {
  // Because we're fetching this endpoint via `sdk.quickAuth.fetch`,
  // if we're in a mini app, the request will include the necessary `Authorization` header.
  const authorization = request.headers.get("Authorization");

  // Here we ensure that we have a valid token.
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Missing token" }, { status: 401 });
  }

  try {
    // Now we verify the token. `domain` must match the domain of the request.
    // In our case, we're using the `getUrlHost` function to get the domain of the request
    // based on the Vercel environment. This will vary depending on your hosting provider.
    const payload = await client.verifyJwt({
      token: authorization.split(" ")[1] as string,
      domain: getUrlHost(request),
    });

    console.log("payload", payload);

    // If the token was valid, `payload.sub` will be the user's Farcaster ID.
    const userFid = payload.sub;

    // Get username and pfp from query parameters (passed from frontend)
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username") || undefined;
    const pfpUrl = searchParams.get("pfpUrl") || undefined;

    // Save user to PostgreSQL database (via backend API)
    let savedUsername = username;
    try {
      // Create JWT token for backend API auth
      const backendToken = jwt.sign(
        { userId: userFid, fid: userFid },
        process.env.JWT_SECRET || "fallback_secret",
        { expiresIn: "7d" }
      );

      // Call backend to save/update user with username and avatar
      const response = await fetch(`${BACKEND_URL}/auth/farcaster`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${backendToken}`,
        },
        body: JSON.stringify({
          fid: userFid,
          username,
          avatar: pfpUrl,
        }),
      });

      const data = await response.json();
      if (data.success && data.user) {
        savedUsername = data.user.username;
      }
    } catch (err) {
      console.error("Failed to save user to database:", err);
      // Continue anyway - auth still works
    }

    // Return user information and backend token
    return NextResponse.json({
      success: true,
      user: {
        fid: userFid,
        username: savedUsername,
        issuedAt: payload.iat,
        expiresAt: payload.exp,
      },
      token: jwt.sign(
        { userId: userFid, fid: userFid, username: savedUsername },
        process.env.JWT_SECRET || "fallback_secret",
        { expiresIn: "7d" }
      ),
    });

  } catch (e) {
    if (e instanceof Errors.InvalidTokenError) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    if (e instanceof Error) {
      return NextResponse.json({ message: e.message }, { status: 500 });
    }
    throw e;
  }
}