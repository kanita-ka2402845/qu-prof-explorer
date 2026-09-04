import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();

  const { data: sessionData, error } = await supabasePublic.auth.verifyOtp({
    email,
    token: code,
    type: "email",
  });

  if (error || !sessionData.session) {
    return NextResponse.json({ error: error?.message || "Invalid or expired code." }, { status: 400 });
  }

  const userId = sessionData.session.user.id;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

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
    access_token: sessionData.session.access_token,
    refresh_token: sessionData.session.refresh_token,
  });
}