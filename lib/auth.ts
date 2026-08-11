import { supabase } from './supabase'

export async function sendOTP(email: string): Promise<{ error: string | null }> {
  if (!email.endsWith('@qu.edu.qa')) {
    return { error: 'Only @qu.edu.qa email addresses are allowed.' }
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true }
  })

  return { error: error?.message ?? null }
}

export async function verifyOTP(email: string, token: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  })

  return { error: error?.message ?? null }
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function signOut() {
  await supabase.auth.signOut()
}