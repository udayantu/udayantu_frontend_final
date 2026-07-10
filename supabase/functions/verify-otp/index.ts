import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return new Response(
        JSON.stringify({ error: 'Phone and OTP are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch student registration record
    const { data: registration, error: fetchError } = await supabase
      .from('student_registrations')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (!registration) {
      return new Response(
        JSON.stringify({ error: 'Phone number not registered' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if OTP is expired
    const now = new Date();
    const expiresAt = new Date(registration.otp_expires_at);
    if (now > expiresAt) {
      return new Response(
        JSON.stringify({ error: 'OTP has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify OTP
    if (registration.otp_code !== otp) {
      // Track failed verification attempts
      const { data: limit } = await supabase
        .from('otp_rate_limits')
        .select('*')
        .eq('phone', phone)
        .maybeSingle();
      
      if (limit) {
        const newAttempts = limit.attempts + 1;
        if (newAttempts >= 10) {
          await supabase.from('otp_rate_limits').update({
            blocked_until: new Date(Date.now() + 3600000).toISOString(),
            attempts: newAttempts
          }).eq('phone', phone);
        } else {
          await supabase.from('otp_rate_limits').update({
            attempts: newAttempts,
            last_attempt: new Date().toISOString()
          }).eq('phone', phone);
        }
      }
      
      return new Response(
        JSON.stringify({ error: 'Invalid OTP' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create or get auth user
    let userId = registration.user_id;
    const email = `${phone}@udayantu.local`;
    
    // Generate a secure random password (never exposed to client)
    const securePassword = crypto.randomUUID() + crypto.randomUUID();

    if (!userId) {
      // Create auth user with phone as email
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: securePassword,
        email_confirm: true,
        user_metadata: {
          phone,
          registration_method: 'otp',
        },
      });

      if (authError) {
        console.error('Auth user creation error:', authError.message);
        throw new Error('Failed to create user account');
      }

      userId = authData.user.id;

      // Update registration with user_id (CRITICAL for RLS)
      const { error: updateError } = await supabase
        .from('student_registrations')
        .update({ user_id: userId })
        .eq('phone', phone);

      if (updateError) {
        console.error('Failed to link user_id to registration');
        throw new Error('Registration linkage failed');
      }

      // Create user role with upsert to handle retries
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: 'student',
        }, {
          onConflict: 'user_id,role',
          ignoreDuplicates: true,
        });

      if (roleError) {
        console.error('Failed to create user role');
        // Don't throw - role might already exist
      }
    } else {
      // Update existing user's password
      const { error: passwordError } = await supabase.auth.admin.updateUserById(
        userId,
        { password: securePassword }
      );
      
      if (passwordError) {
        console.error('Failed to update password');
      }
    }

    // Mark OTP as verified
    const { error: verifyError } = await supabase
      .from('student_registrations')
      .update({
        otp_status: 'verified',
        otp_code: null,
        otp_expires_at: null,
      })
      .eq('phone', phone);

    if (verifyError) throw verifyError;

    // Clear rate limit on successful verification
    await supabase
      .from('otp_rate_limits')
      .delete()
      .eq('phone', phone);

    // Sign in the user server-side and return session tokens
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: securePassword,
    });

    if (signInError || !signInData.session) {
      console.error('Sign in error after OTP verification');
      throw new Error('Failed to create session');
    }

    // Return session tokens (NOT credentials) for secure client-side auth
    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        session: {
          access_token: signInData.session.access_token,
          refresh_token: signInData.session.refresh_token,
          expires_at: signInData.session.expires_at,
        },
        registration: {
          full_name: registration.full_name,
          email: registration.email,
          payment_status: registration.payment_status,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in verify-otp:', errorMessage);
    return new Response(
      JSON.stringify({ error: 'Verification failed. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});