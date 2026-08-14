import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  const { data: linkData, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (error || !linkData) {
    return NextResponse.json({ error: "Failed to generate code." }, { status: 500 });
  }

  const otp = linkData.properties.email_otp;

  const { error: emailError } = await resend.emails.send({
    from: "QU Prof Explorer <onboarding@resend.dev>",
    to: "ka2402845@qu.edu.qa",
    subject: "Your QU Prof Explorer verification code",
    html: `
      <div style="font-family: monospace; background: #0d0e10; color: #e8edf5; padding: 40px; border-radius: 12px; max-width: 400px;">
        <p style="color: #4a4f5a; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 24px;">QU PROF EXPLORER</p>
        <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Your verification code</h2>
        <p style="color: #8a909c; margin-bottom: 32px;">Enter this code to sign in. Expires in 10 minutes.</p>
        <div style="font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #e8edf5; background: #1a1c20; padding: 24px; border-radius: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.07);">
          ${otp}
        </div>
        <p style="color: #4a4f5a; font-size: 11px; margin-top: 24px;">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });

  if (emailError) {
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}