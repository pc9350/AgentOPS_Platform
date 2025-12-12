import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

// Debug: Check if env vars are loaded
if (typeof window !== 'undefined') {
  console.log('Supabase URL:', supabaseUrl ? 'Set' : 'MISSING!')
  console.log('Supabase Key:', supabaseKey ? 'Set' : 'MISSING!')
}

export const createClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables. Check your .env.local file.')
  }
  
  return createBrowserClient(supabaseUrl, supabaseKey);
};
