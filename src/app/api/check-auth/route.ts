import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = "lookout_session";

function getSessionToken(): string {
  const secret = process.env.SITE_PASSWORD || "lookout-default";
  return crypto.createHash("sha256").update(secret).digest("hex");
}

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const valid = !!cookie && cookie === getSessionToken();
  return NextResponse.json({ authenticated: valid });
}
