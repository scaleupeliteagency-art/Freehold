import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    clientId: process.env.PAYPAL_CLIENT_ID || null,
    currency: (process.env.PAYPAL_CURRENCY || "USD").toUpperCase()
  });
}