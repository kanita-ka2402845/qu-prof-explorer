import { supabase } from './supabase'

export async function sendOTP(email: string): Promise<{ error: string | null }> {
  const res = await fetch('/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  return { error: data.error ?? null };
}

export async function verifyOTP(email: string, token: string): Promise<{ error: string | null }> {
  const res = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code: token }),
  });
  const data = await res.json();
  if (data.error) return { error: data.error };

  // Set the session in Supabase client so useAuth picks it up
  const { error } = await supabase.auth.setSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  });

  return { error: error?.message ?? null };
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function signOut() {
  await supabase.auth.signOut()
}