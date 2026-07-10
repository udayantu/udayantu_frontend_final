import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

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
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(Deno.env.get('RAZORPAY_KEY_SECRET') ?? '');
    const messageData = encoder.encode(body);
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const expectedSignature = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const isValid = expectedSignature === razorpay_signature;

    console.log('Payment verification:', {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      isValid,
    });

    if (!isValid) {
      throw new Error('Invalid payment signature');
    }

    // Update payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({
        razorpay_payment_id,
        status: 'success',
        method: 'razorpay',
        gateway_response: {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          verified_at: new Date().toISOString(),
        },
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .select()
      .single();

    if (paymentError) {
      console.error('Payment update error:', paymentError);
      throw paymentError;
    }

    // Update student registration
    await supabase
      .from('student_registrations')
      .update({
        payment_status: 'paid',
      })
      .eq('payment_order_id', razorpay_order_id);

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${user.id.slice(0, 8)}`;

    // Create invoice record
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        student_id: user.id,
        payment_id: payment.id,
        invoice_number: invoiceNumber,
      })
      .select()
      .single();

    if (invoiceError) {
      console.error('Invoice creation error:', invoiceError);
    }

    // Send payment confirmation email and SMS
    try {
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-payment-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({
          userId: user.id,
          transactionId: razorpay_payment_id,
          amount: payment.amount_final_inr || payment.amount,
          invoiceNumber: invoiceNumber,
        }),
      });
    } catch (notificationError) {
      console.error('Failed to send confirmation notifications:', notificationError);
      // Don't fail the payment if notifications fail
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment_id: payment.id,
        invoice_number: invoiceNumber,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
