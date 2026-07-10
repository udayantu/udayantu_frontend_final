import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  name?: string;
  email: string;
  company?: string;
  otp?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, company, otp }: WelcomeEmailRequest = await req.json();

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (otp) {
      // Just check if the employer exists in the database
      const { data: employer, error: dbError } = await supabase
        .from("employers")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      if (dbError) {
        console.error("Database error validating employer for OTP:", dbError.message);
        return new Response(
          JSON.stringify({ error: "Validation failed" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (!employer) {
        console.warn("Rejected OTP request - no employer record found for:", email);
        return new Response(
          JSON.stringify({ error: "Employer not registered on waitlist" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      console.log("Validated employer, sending login OTP email to:", email);

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "UdaYantu <onboarding@resend.dev>",
          to: [email],
          subject: "Your UdaYantu Employer Verification Code",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 25px; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
              <h2 style="color: #0F172A; font-size: 20px; font-weight: 700; margin-bottom: 16px;">UdaYantu Employer Verification</h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">Please use the following verification code to sign into your administrative employer session. This code is valid for 10 minutes:</p>
              <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
                <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #0EA5E9;">${otp}</span>
              </div>
              <p style="color: #94a3b8; font-size: 11px; line-height: 1.4; margin-top: 24px; border-t: 1px solid #f1f5f9; padding-top: 16px;">If you did not request this login attempt, please ignore this email or contact security support.</p>
            </div>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const error = await emailResponse.json();
        throw new Error(error.message || "Failed to send OTP email");
      }

      const result = await emailResponse.json();
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Welcome email requires recent signup (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: employer, error: dbError } = await supabase
      .from("employers")
      .select("email, created_at")
      .eq("email", email)
      .gte("created_at", fiveMinutesAgo)
      .maybeSingle();

    if (dbError) {
      console.error("Database error validating employer:", dbError.message);
      return new Response(
        JSON.stringify({ error: "Validation failed" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!employer) {
      console.warn("Rejected email attempt - no recent employer record for:", email.substring(0, 3) + "***");
      return new Response(
        JSON.stringify({ error: "Invalid request - employer not found or registration expired" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Validated employer, sending welcome email");

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "UdaYantu <onboarding@resend.dev>",
        to: [email],
        bcc: ["udayantu10x@gmail.com"],
        subject: "Welcome to UdaYantu Employer Waitlist — Priority Access Confirmed",
        html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 40px 20px;
                text-align: center;
                color: #ffffff;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
              }
              .content {
                padding: 40px 30px;
              }
              .content p {
                margin: 0 0 16px;
                font-size: 16px;
              }
              .greeting {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 24px;
              }
              .benefits {
                background-color: #f8f9fa;
                border-left: 4px solid #667eea;
                padding: 20px;
                margin: 24px 0;
              }
              .benefits h3 {
                margin: 0 0 12px;
                font-size: 18px;
                color: #667eea;
              }
              .benefits ul {
                margin: 0;
                padding-left: 20px;
              }
              .benefits li {
                margin-bottom: 8px;
              }
              .footer {
                background-color: #f8f9fa;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e9ecef;
              }
              .footer p {
                margin: 0;
                font-size: 14px;
                color: #6c757d;
              }
              .signature {
                margin-top: 32px;
                padding-top: 24px;
                border-top: 1px solid #e9ecef;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Welcome to UdaYantu</h1>
              </div>
              
              <div class="content">
                <p class="greeting">Hello ${name},</p>
                
                <p>
                  Thank you for joining the <strong>UdaYantu Employer Waitlist</strong>.
                </p>
                
                <p>
                  You're now part of our founding employer network — the first to access trained graduates from rural and Tier-4/5 towns.
                </p>
                
                <div class="benefits">
                  <h3>Here's what you can expect:</h3>
                  <ul>
                    <li>Priority updates on upcoming graduate batches</li>
                    <li>Early access to job-ready talent at fresher budgets</li>
                    <li>Influence over training modules to match your hiring needs</li>
                    <li>Exclusive hiring benefits for waitlist partners</li>
                  </ul>
                </div>
                
                <p>
                  We're excited to build this journey with you and ${company}.
                </p>
                
                <p>
                  Your spot is secured, and we'll keep you updated as the first batches graduate.
                </p>
                
                <div class="signature">
                  <p><strong>Warm regards,</strong></p>
                  <p>Team UdaYantu</p>
                </div>
              </div>
              
              <div class="footer">
                <p>
                  This email was sent to ${email} because you joined our employer waitlist.
                </p>
                <p style="margin-top: 8px;">
                  © ${new Date().getFullYear()} UdaYantu. All rights reserved.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.json();
      throw new Error(error.message || "Failed to send email");
    }

    const result = await emailResponse.json();
    console.log("Employer welcome email sent successfully");

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending employer welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
