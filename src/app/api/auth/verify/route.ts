import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { passcode } = await req.json();
    const masterPasscode = process.env.ADMIN_PASSCODE;

    if (!masterPasscode) {
      console.error("ADMIN_PASSCODE not set in environment");
      return NextResponse.json({ success: false, error: "SERVER_CONFIG_ERROR" }, { status: 500 });
    }

    if (passcode === masterPasscode) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "INVALID_ACCESS_CODE" }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ success: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
