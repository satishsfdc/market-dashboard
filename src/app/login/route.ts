import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = "lookout_session";

function getSessionToken(): string {
  const secret = process.env.SITE_PASSWORD || "lookout-default";
  return crypto.createHash("sha256").update(secret).digest("hex");
}

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const expected = process.env.SITE_PASSWORD;

  if (!expected) {
    return NextResponse.json(
      { error: "SITE_PASSWORD is not configured on the server." },
      { status: 500 }
    );
  }

  if (password !== expected) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, getSessionToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
