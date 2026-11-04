import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const token = String(body.code ?? "").replace(/\D/g, "");

  if (!email.endsWith("@qu.edu.qa") || token.length === 0) {
    return NextResponse.json({ error: "Invalid email or code." }, { status: 400 });
  }

  // New accounts get a "signup" token, existing ones a "magiclink" token
  let session: Session | null = null;
  for (const type of ["magiclink", "signup", "email"] as const) {
    const { data, error } = await supabasePublic.auth.verifyOtp({ email, token, type });
    if (!error && data.session) { session = data.session; break; }
  }

  if (!session) {
    return NextResponse.json(
      { error: "That code is invalid or expired. Request a new one and use the newest email." },
      { status: 400 }
    );
  }

  const userId = session.user.id;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    const adjectives = ['Quiet','Clear','Sharp','Steady','Bright','Calm','Swift','Bold','Keen','Wise'];
    const nouns = ['Signal','Vector','Horizon','Cipher','Pulse','Vertex','Prism','Orbit','Nexus','Atlas'];
    const suffix = Math.floor(1000 + Math.random() * 9000).toString();
    const username = adjectives[Math.floor(Math.random() * adjectives.length)] +
                     nouns[Math.floor(Math.random() * nouns.length)] + '_' + suffix;

    await supabaseAdmin.from("profiles").insert({
      id: userId,
      username,
      qu_email: email,
      review_count: 0,
    });
  }

  return NextResponse.json({
    success: true,
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
}