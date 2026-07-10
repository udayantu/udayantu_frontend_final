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
    const { phone } = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ error: 'Phone number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate Indian phone number format
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return new Response(
        JSON.stringify({ error: 'Invalid Indian phone number format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check rate limit
    const { data: limit } = await supabase
      .from('otp_rate_limits')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    // Block if currently blocked
    if (limit?.blocked_until && new Date(limit.blocked_until) > new Date()) {
      const minutesLeft = Math.ceil((new Date(limit.blocked_until).getTime() - Date.now()) / 60000);
      return new Response(
        JSON.stringify({ error: `Too many attempts. Please try again in ${minutesLeft} minute(s).` }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check attempts in last hour (5 max)
    if (limit) {
      const hourAgo = new Date(Date.now() - 3600000);
      const lastAttempt = new Date(limit.last_attempt);
      
      if (lastAttempt > hourAgo && limit.attempts >= 5) {
        await supabase.from('otp_rate_limits').update({
          blocked_until: new Date(Date.now() + 3600000).toISOString(),
          attempts: limit.attempts + 1
        }).eq('phone', phone);
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Update or reset attempts
      const newAttempts = lastAttempt <= hourAgo ? 1 : limit.attempts + 1;
      await supabase.from('otp_rate_limits').update({
        attempts: newAttempts,
        last_attempt: new Date().toISOString(),
        ...(lastAttempt <= hourAgo && { blocked_until: null })
      }).eq('phone', phone);
    } else {
      await supabase.from('otp_rate_limits').insert({ phone, attempts: 1 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in student_registrations table
    const { data: existing, error: fetchError } = await supabase
      .from('student_registrations')
      .select('id, otp_status')
      .eq('phone', phone)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (existing) {
      // Update existing record with new OTP
      const { error: updateError } = await supabase
        .from('student_registrations')
        .update({
          otp_code: otp,
          otp_expires_at: expiresAt.toISOString(),
          otp_status: 'unverified',
        })
        .eq('phone', phone);

      if (updateError) {
        console.error('Failed to update OTP:', updateError);
        throw new Error('Failed to generate OTP. Please try again.');
      }
    } else {
      // Create new record for phone number
      const { error: insertError } = await supabase
        .from('student_registrations')
        .insert({
          phone,
          otp_code: otp,
          otp_expires_at: expiresAt.toISOString(),
          otp_status: 'unverified',
          full_name: '',
          email: '',
          desired_role: 'undecided',
        });

      if (insertError) throw insertError;
    }

    // Send OTP via Twilio (with graceful fallback for trial accounts)
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    let smsSent = false;
    let smsError: string | null = null;

    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
      try {
        // Send SMS via Twilio
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
        const twilioAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
        
        const twilioResponse = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${twilioAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: `+91${phone}`,
            From: twilioPhoneNumber,
            Body: `Your UdaYantu verification code is: ${otp}. Valid for 10 minutes.`,
          }),
        });

        if (!twilioResponse.ok) {
          const twilioError = await twilioResponse.json();
          console.error('Twilio error code:', twilioError.code, 'status:', twilioError.status);
          
          // Check if it's a trial account restriction
          if (twilioError.code === 21608) {
            console.warn('Twilio trial account - unverified number. OTP stored but not sent via SMS.');
            smsError = 'Trial account - verify number at twilio.com or use development OTP';
          } else {
            smsError = 'SMS sending failed';
          }
        } else {
          smsSent = true;
          console.log(`OTP sent successfully via SMS to ${phone}`);
        }
      } catch (error) {
        console.error('Error sending SMS:', error);
        smsError = 'SMS service error';
      }
    } else {
      console.warn('Twilio credentials not configured');
      smsError = 'SMS service not configured';
    }

    // Build response - always succeed if OTP is stored, even if SMS fails
    const response: any = {
      success: true,
      message: smsSent 
        ? 'OTP sent successfully via SMS' 
        : 'OTP generated successfully. Please check your phone or contact support.',
      smsSent,
    };

    // Never expose OTP in API response - it's stored securely in the database
    if (!smsSent) {
      response.fallbackMode = true;
      response.note = 'SMS delivery pending. If you do not receive the code, please retry or contact support.';
      // Log without exposing actual OTP value
      console.log(`OTP generated for phone ending in ${phone.slice(-4)}`);
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in send-otp:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
