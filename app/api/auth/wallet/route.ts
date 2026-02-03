import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Backend API URL
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, username, avatar } = body;

    if (!address) {
      return NextResponse.json(
        { success: false, error: "Address required" },
        { status: 400 }
      );
    }

    // Call backend to create/find user and get user data
    const response = await fetch(`${BACKEND_URL}/auth/wallet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address,
        username: username || null,
        avatar: avatar || null,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          success: false,
          error: errorData.error || "Authentication failed",
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.success && data.token && data.user) {
      // Return the token and user data from backend
      return NextResponse.json({
        success: true,
        token: data.token,
        user: data.user,
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Authentication failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Wallet auth error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
