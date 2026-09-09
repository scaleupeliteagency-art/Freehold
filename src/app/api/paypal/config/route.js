import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const currency = process.env.PAYPAL_CURRENCY;
  const environment = process.env.PAYPAL_ENVIRONMENT;

  return NextResponse.json({
    clientId: clientId || null,
    currency: (currency || "USD").toUpperCase(),
    configured: Boolean(clientId && clientSecret && currency && environment),
    missing: [
      !clientId && "PAYPAL_CLIENT_ID",
      !clientSecret && "PAYPAL_CLIENT_SECRET",
      !currency && "PAYPAL_CURRENCY",
      !environment && "PAYPAL_ENVIRONMENT"
    ].filter(Boolean)
  }, {
    headers: { "Cache-Control": "no-store" }
  });
}