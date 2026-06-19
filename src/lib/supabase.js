// ─────────────────────────────────────────────────────────────
// supabase.js — the client.
//
// Vite only exposes env vars prefixed VITE_ to the browser, so the two
// keys the app reads are VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
// Set them in Vercel → Settings → Environment Variables (and in a local
// .env for dev — see .env.example).
//
// The client is built only when both are present. That way the app
// still renders with the env unset and can say so plainly, instead of
// crashing on boot — which is what you want from a page you're aiming a
// test subdomain at.
// ─────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js'

const url  = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(url && anon)
export const supabase = supabaseConfigured ? createClient(url, anon) : null
