import { NextResponse } from "next/server";

const paypalBaseUrl = process.env.PAYPAL_ENVIRONMENT === "production"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const credentials = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials"
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || "PayPal authentication failed.");
  return data.access_token;
}

export async function POST(request) {
  try {
    const { orderId } = await request.json();
    if (!orderId) return NextResponse.json({ error: "PayPal order ID is required." }, { status: 400 });
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET || !process.env.PAYPAL_CURRENCY || !process.env.PAYPAL_ENVIRONMENT) {
      return NextResponse.json({ error: "PayPal server configuration is incomplete." }, { status: 400 });
    }
    const accessToken = await getAccessToken();
    const response = await fetch(`${paypalBaseUrl}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }
    });
    const data = await response.json();
    if (!response.ok || data.status !== "COMPLETED") {
      const detail = data.details?.map((item) => item.description || item.issue).filter(Boolean).join(" ");
      return NextResponse.json({ error: detail || data.message || "PayPal payment was not completed.", paypalName: data.name || null }, { status: response.status || 400 });
    }
    return NextResponse.json({ status: data.status, captureId: data.purchase_units?.[0]?.payments?.captures?.[0]?.id || null });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}