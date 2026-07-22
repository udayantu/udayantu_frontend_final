import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ptlgpjixohgmhvrqfmdw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0bGdwaml4b2hnbWh2cnFmbWR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzYxODUyNywiZXhwIjoyMDk5MTk0NTI3fQ.nAb2dflkC_7U-tZ1U9RMfCMM58_Q9YE-cksNGern6yo';

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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    // Update payment record
    const { error: payUpdateErr } = await supabase
      .from('payments')
      .update({ 
        status: 'captured', 
        razorpay_payment_id 
      })
      .eq('razorpay_order_id', razorpay_order_id);

    if (payUpdateErr) throw payUpdateErr;

    // Update student registration to paid
    const { error: regUpdateErr } = await supabase
      .from('student_registrations')
      .update({ payment_status: 'paid' })
      .eq('payment_order_id', razorpay_order_id);

    if (regUpdateErr) throw regUpdateErr;

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error in verify-payment serverless function:', error);
    return res.status(500).json({ error: error.message });
  }
}
