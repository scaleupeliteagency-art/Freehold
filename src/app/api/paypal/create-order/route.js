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
    const { amount, currency } = await request.json();
    if (!amount || !currency || !process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET || !process.env.PAYPAL_CURRENCY || !process.env.PAYPAL_ENVIRONMENT) {
      return NextResponse.json({ error: "PayPal server configuration is incomplete." }, { status: 400 });
    }
    const paypalCurrency = (process.env.PAYPAL_CURRENCY || "USD").toUpperCase();
    if (currency.toUpperCase() !== paypalCurrency) {
      return NextResponse.json({ error: `PayPal checkout must use ${paypalCurrency}. Set PAYPAL_CURRENCY to the same value.` }, { status: 400 });
    }
    const accessToken = await getAccessToken();
    const response = await fetch(`${paypalBaseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{ amount: { currency_code: currency, value: Number(amount).toFixed(2) } }]
      })
    });
    const data = await response.json();
    if (!response.ok) {
      const detail = data.details?.map((item) => item.description || item.issue).filter(Boolean).join(" ");
      return NextResponse.json({ error: detail || data.message || "Unable to create PayPal order.", paypalName: data.name || null }, { status: response.status });
    }
    return NextResponse.json({ orderId: data.id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}