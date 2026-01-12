import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * Get the current session for server-side authentication
 * 
 * @returns The current session or null if not authenticated
 */
export async function auth() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Unexpected error in auth():', error);
    return null;
  }
}
