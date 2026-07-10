import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('No authorization header provided');
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized: ' + userError.message);
    }

    if (!user) {
      console.error('No user found from token');
      throw new Error('Unauthorized: Invalid token');
    }

    console.log('User authenticated:', user.id);

    // Get config for pricing
    const { data: config } = await supabase
      .from('configs')
      .select('config')
      .single();

    const pricing = config?.config?.pricing || { baseAmount: 5000, currency: 'INR' };
    const gstPercent = config?.config?.gst?.percent || 18;

    // Calculate amounts
    const baseAmount = pricing.baseAmount;
    const gstAmount = Math.round((baseAmount * gstPercent) / 100);
    const finalAmount = baseAmount + gstAmount;

    // Create Razorpay order using REST API
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID') ?? '';
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET') ?? '';
    const credentials = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
        body: JSON.stringify({
          amount: finalAmount * 100, // Razorpay expects amount in paise
          currency: pricing.currency,
          receipt: `receipt_${user.id.slice(0, 8)}_${Date.now()}`,
          notes: {
            user_id: user.id,
          },
        }),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error('Razorpay API error:', errorText);
      throw new Error('Failed to create payment order');
    }

    const razorpayOrder = await razorpayResponse.json();
    console.log('Razorpay order created:', razorpayOrder.id);

    // Create payment record in database with admission_fee metadata
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        amount: finalAmount * 100,
        razorpay_order_id: razorpayOrder.id,
        status: 'created',
        currency: pricing.currency,
        amount_base_inr: baseAmount,
        gst_percent: gstPercent,
        gst_amount_inr: gstAmount,
        amount_final_inr: finalAmount,
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment record creation error:', paymentError);
      throw paymentError;
    }

    // Update student registration with order ID
    await supabase
      .from('student_registrations')
      .update({
        payment_order_id: razorpayOrder.id,
        payment_status: 'pending',
      })
      .eq('user_id', user.id);

    return new Response(
      JSON.stringify({
        order_id: razorpayOrder.id,
        amount: finalAmount * 100,
        currency: pricing.currency,
        key_id: razorpayKeyId,
        payment_id: payment.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error creating payment order:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
