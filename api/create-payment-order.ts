import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ptlgpjixohgmhvrqfmdw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0bGdwaml4b2hnbWh2cnFmbWR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzYxODUyNywiZXhwIjoyMDk5MTk0NTI3fQ.nAb2dflkC_7U-tZ1U9RMfCMM58_Q9YE-cksNGern6yo';

const razorpayKeyId = "rzp_live_TBiIvzhEutsj8F";
const razorpayKeySecret = "agWByu52qWlbieuD457a0ieu";

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ error: 'Missing user_id parameter' });
    }

    // Get configs for pricing
    const { data: config } = await supabase
      .from('configs')
      .select('config')
      .single();

    const pricing = config?.config?.pricing || { baseAmount: 5321 };
    const gstPercent = config?.config?.gst?.percent || 18;

    const baseAmount = pricing.baseAmount;
    const gstAmount = Math.round((baseAmount * gstPercent) / 100);
    const finalAmount = baseAmount + gstAmount;

    // Create Razorpay order using REST API
    const credentials = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: finalAmount * 100, // paise
        currency: 'INR',
        receipt: `receipt_${user_id.slice(0, 8)}_${Date.now()}`,
        notes: { user_id },
      }),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error('Razorpay API error:', errorText);
      return res.status(500).json({ error: 'Failed to create payment order: ' + errorText });
    }

    const razorpayOrder = await razorpayResponse.json();

    // Insert payment record into database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id,
        amount: finalAmount * 100,
        razorpay_order_id: razorpayOrder.id,
        status: 'created',
        currency: 'INR',
        amount_base_inr: baseAmount,
        gst_percent: gstPercent,
        gst_amount_inr: gstAmount,
        amount_final_inr: finalAmount,
      })
      .select()
      .single();

    if (paymentError) {
      throw paymentError;
    }

    // Update student registration with order ID
    await supabase
      .from('student_registrations')
      .update({
        payment_order_id: razorpayOrder.id,
        payment_status: 'pending',
      })
      .eq('user_id', user_id);

    return res.status(200).json({
      order_id: razorpayOrder.id,
      amount: finalAmount * 100,
      currency: 'INR',
      key_id: razorpayKeyId,
      payment_id: payment.id,
    });
  } catch (error: any) {
    console.error('Error in create-payment-order serverless function:', error);
    return res.status(500).json({ error: error.message });
  }
}
