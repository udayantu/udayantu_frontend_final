import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentConfirmationRequest {
  userId: string;
  transactionId: string;
  amount: number;
  invoiceNumber: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, transactionId, amount, invoiceNumber }: PaymentConfirmationRequest = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch user details
    const { data: registration } = await supabase
      .from('student_registrations')
      .select('full_name, email, phone')
      .eq('user_id', userId)
      .single();

    if (!registration) {
      throw new Error('User registration not found');
    }

    const { full_name, email, phone } = registration;

    // Send SMS via Twilio
    if (phone && TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
      try {
        const smsBody = `UdaYantu: Seat confirmed for ${full_name}. ₹${amount.toLocaleString()} received. Invoice emailed. We're thrilled to have you! — Team UdaYantu`;
        
        const twilioAuth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
        
        await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${twilioAuth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              To: phone,
              From: TWILIO_PHONE_NUMBER!,
              Body: smsBody,
            }),
          }
        );
        
        console.log('SMS sent successfully to', phone);
      } catch (smsError) {
        console.error('SMS error:', smsError);
        // Don't fail the whole request if SMS fails
      }
    }

    // Send email via Resend
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0EA5E9 0%, #8B5CF6 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e5e7eb; border-top: none; }
            .details-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-row:last-child { border-bottom: none; }
            .cta-button { display: inline-block; background: #0EA5E9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-radius: 0 0 8px 8px; }
            .terms { background: #fffbeb; border: 1px solid #fbbf24; border-radius: 6px; padding: 15px; margin: 20px 0; }
            ul { padding-left: 20px; }
            li { margin: 8px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🎉 Welcome to UdaYantu!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.95;">Your seat is confirmed</p>
            </div>
            
            <div class="content">
              <p>Hi <strong>${full_name}</strong>,</p>
              
              <p>We're honored to confirm your seat. Your admission fee is received securely.</p>
              
              <div class="details-box">
                <div class="detail-row">
                  <span><strong>Amount:</strong></span>
                  <span>₹${amount.toLocaleString()}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Transaction ID:</strong></span>
                  <span style="font-family: monospace; font-size: 12px;">${transactionId}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Invoice Number:</strong></span>
                  <span style="font-family: monospace;">${invoiceNumber}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Payment Method:</strong></span>
                  <span>Razorpay</span>
                </div>
              </div>
              
              <div class="terms">
                <h3 style="margin-top: 0; color: #92400e;">📋 What this payment is:</h3>
                <p style="margin: 0;"><strong>Admission fee only</strong> — training, development, and placement are separate</p>
              </div>
              
              <h3>🚀 Next Steps:</h3>
              <ul>
                <li>Complete your skills assessment to unlock personalized guidance</li>
                <li>Visit your dashboard to begin your journey</li>
                <li>Need help? WhatsApp/Call/Email us anytime</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || ''}/dashboard" class="cta-button">
                  View Your Dashboard →
                </a>
              </div>
              
              <div class="terms">
                <h3 style="margin-top: 0; color: #92400e;">🔁 Fair-use Refund Terms (Short Version):</h3>
                <ul style="margin: 10px 0;">
                  <li>If you aren't selected for a job after completing your assessment and guidance, request a refund within 180 days</li>
                  <li>We keep it simple: full admission fee refunded; no hidden deductions</li>
                  <li>To claim: reply to this email with your Transaction ID or message us on WhatsApp</li>
                </ul>
              </div>
              
              <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                <strong>Support channels:</strong><br>
                📞 Phone: [Your Phone]<br>
                📱 WhatsApp: [Your WhatsApp]<br>
                ✉️ Email: support@udayantu.com
              </p>
              
              <p style="margin-top: 20px;">With warmth and respect,<br><strong>— Team UdaYantu</strong></p>
            </div>
            
            <div class="footer">
              <p><strong>Legal & Compliance:</strong></p>
              <p>GST invoice attached (PDF) with all statutory fields<br>
              PCI-DSS secure payment via Razorpay</p>
              <p style="margin-top: 15px; font-size: 12px;">
                © ${new Date().getFullYear()} UdaYantu. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "UdaYantu <onboarding@resend.dev>",
        to: [email],
        subject: `Welcome, ${full_name} — Your seat is confirmed at UdaYantu`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.json();
      throw new Error(error.message || "Failed to send email");
    }

    console.log('Payment confirmation email sent successfully to', email);

    return new Response(
      JSON.stringify({ success: true, message: 'Confirmation sent successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error sending payment confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
