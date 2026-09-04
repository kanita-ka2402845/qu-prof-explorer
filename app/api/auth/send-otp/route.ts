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

  if (!email.endsWith('@qu.edu.qa')) {
    return NextResponse.json(
      { error: 'Please enter your QU email address (@qu.edu.qa).' },
      { status: 400 }
    );
  }

  // Use signInWithOtp — generates token with full expiry window
  const { error: otpError } = await supabaseAdmin.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true }
  });

  if (otpError) {
    return NextResponse.json({ error: otpError.message }, { status: 500 });
  }

  // Generate link separately just to get the email_otp code
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (linkError || !linkData) {
    return NextResponse.json({ error: "Failed to generate code." }, { status: 500 });
  }

  const otp = linkData.properties.email_otp;

  const { error: emailError } = await resend.emails.send({
    from: "QU Prof Explorer <noreply@quprofexplorer.com>",
    to: email,
    subject: "Your QU Prof Explorer verification code",
    html: `
      <div style="font-family: monospace; background: #0d0e10; color: #e8edf5; padding: 40px; border-radius: 12px; max-width: 400px;">
        <p style="color: #4a4f5a; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 24px;">QU PROF EXPLORER</p>
        <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Your verification code</h2>
        <p style="color: #8a909c; margin-bottom: 32px;">Enter this code to sign in. Expires in 1 hour.</p>
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