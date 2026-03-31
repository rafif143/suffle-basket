import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST({ request }) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return json({
      success: false,
      message: 'Email and password are required'
    }, { status: 400 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return json({
      success: false,
      message: error.message
    }, { status: 401 });
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  return json({
    success: true,
    user: {
      id: data.user.id,
      email: data.user.email,
      role: profile?.role || 'organizer',
      full_name: profile?.full_name || data.user.user_metadata?.full_name
    },
    session: data.session
  });
}
