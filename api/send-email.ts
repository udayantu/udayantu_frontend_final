import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      type, 
      email, 
      name, 
      company, 
      otp, 
      mobile, 
      role, 
      city, 
      message,
      contact_name,
      company_name,
      job_role,
      hiring_count,
      location,
      waitlist_id,
      submitted_date
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (type === 'contact') {
      const { data, error } = await resend.emails.send({
        from: 'UdaYantu Portal <onboarding@resend.dev>',
        to: ['udayantu10x@gmail.com'],
        subject: `New Contact Inquiry: ${name || 'Inquirer'} (${role || 'Others'})`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 25px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #1E3A63; font-size: 20px; font-weight: 700; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 20px;">New Contact Inquiry Received</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: left; margin-bottom: 20px;">
              <tr>
                <th style="padding: 8px 0; color: #475569; width: 120px;">Full Name:</th>
                <td style="padding: 8px 0; color: #0F172A; font-weight: 600;">${name || 'N/A'}</td>
              </tr>
              <tr>
                <th style="padding: 8px 0; color: #475569;">Email Address:</th>
                <td style="padding: 8px 0; color: #0EA5E9; font-weight: 600;">${email}</td>
              </tr>
              <tr>
                <th style="padding: 8px 0; color: #475569;">Mobile Number:</th>
                <td style="padding: 8px 0; color: #0F172A; font-weight: 600;">${mobile || 'N/A'}</td>
              </tr>
              <tr>
                <th style="padding: 8px 0; color: #475569;">Role/Profile:</th>
                <td style="padding: 8px 0; color: #0F172A; text-transform: capitalize;">${role || 'N/A'}</td>
              </tr>
              <tr>
                <th style="padding: 8px 0; color: #475569;">City:</th>
                <td style="padding: 8px 0; color: #0F172A;">${city || 'N/A'}</td>
              </tr>
            </table>
            <div style="background-color: #f8fafc; border-left: 4px solid #1E3A63; padding: 16px; border-radius: 4px; margin-bottom: 20px;">
              <p style="color: #475569; font-size: 13px; font-weight: 600; margin-top: 0; margin-bottom: 8px;">Message:</p>
              <p style="color: #0F172A; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message || 'No message provided.'}</p>
            </div>
            <p style="color: #94a3b8; font-size: 11px; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 12px;">This inquiry was sent from the Contact Us form on udayantu.com.</p>
          </div>
        `
      });

      if (error) throw error;
      return res.status(200).json({ success: true, data });
    }

    if (type === 'otp') {
      const { data, error } = await resend.emails.send({
        from: 'UdaYantu <onboarding@resend.dev>',
        to: [email],
        subject: 'Your UdaYantu Employer Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 25px; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #0F172A; font-size: 20px; font-weight: 700; margin-bottom: 16px;">UdaYantu Employer Verification</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">Please use the following verification code to sign into your administrative employer session. This code is valid for 10 minutes:</p>
            <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
              <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #0EA5E9;">${otp}</span>
            </div>
            <p style="color: #94a3b8; font-size: 11px; line-height: 1.4; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">If you did not request this login attempt, please ignore this email or contact security support.</p>
          </div>
        `
      });

      if (error) throw error;
      return res.status(200).json({ success: true, data });
    }

    // Default: Welcome email (Waitlist Confirmation)
    const emailYear = new Date().getFullYear();
    const formattedContactName = contact_name || name || 'Partner';
    const formattedCompanyName = company_name || company || 'Your Company';
    const formattedJobRole = job_role || 'General Recruiting';
    const formattedHiringCount = hiring_count || '1-5';
    const formattedLocation = location || 'Remote / Hybrid';
    const formattedWaitlistId = waitlist_id || 'EMP-' + Math.floor(100000 + Math.random() * 900000);
    const formattedSubmittedDate = formattedSubmittedDateValue(submitted_date);
    const formattedDashboardUrl = 'https://udayantu.com/employer-login';

    function formattedSubmittedDateValue(rawDate?: string) {
      if (rawDate) return rawDate;
      return new Date().toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' });
    }

    const { data, error } = await resend.emails.send({
      from: 'UdaYantu <onboarding@resend.dev>',
      to: [email],
      bcc: ['udayantu10x@gmail.com'],
      subject: 'Welcome to UdaYantu Employer Network — Hiring Waitlist Confirmed',
      html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to UdaYantu Employer Network</title>
</head>

<body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f5f7fb">
<tr>
<td align="center">

<table width="640" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="margin:40px auto;border-radius:16px;overflow:hidden;">

<!-- Header -->

<tr>
<td style="background:#0F172A;padding:40px;text-align:center;">

<h1 style="margin:0;color:#ffffff;font-size:34px;font-weight:700;">
UdaYantu
</h1>

<p style="margin:14px 0 0;color:#CBD5E1;font-size:16px;">
Hire Job-Ready Talent. Faster. Smarter. Within Budget.
</p>

</td>
</tr>

<!-- Hero -->

<tr>
<td style="padding:50px 50px 20px;">

<p style="margin:0;font-size:16px;color:#475569;">
Hello <strong>${formattedContactName}</strong>,
</p>

<h2 style="margin:18px 0 20px;font-size:32px;color:#111827;line-height:42px;">
Thank you for joining the UdaYantu Employer Hiring Network.
</h2>

<p style="font-size:17px;line-height:30px;color:#4B5563;margin:0;">
We have successfully received your hiring waitlist request for
<strong>${formattedCompanyName}</strong>.
</p>

<p style="font-size:17px;line-height:30px;color:#4B5563;">
Our Employer Success Team will review your hiring requirements and
match you with skilled, industry-ready candidates trained specifically
for today's workplace.
</p>

</td>
</tr>

<!-- Card -->

<tr>
<td style="padding:10px 40px;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;">
<tr>
<td style="padding:30px;">

<h3 style="margin-top:0;color:#0F172A;font-size:22px;">
What happens next?
</h3>

<table cellpadding="0" cellspacing="0">

<tr>
<td width="32" valign="top" style="font-size:22px;">✅</td>
<td style="padding-bottom:18px;color:#475569;font-size:16px;line-height:28px;">
Our team reviews your hiring preferences, required skills, location,
budget and expected joining timeline.
</td>
</tr>

<tr>
<td valign="top" style="font-size:22px;">✅</td>
<td style="padding-bottom:18px;color:#475569;font-size:16px;line-height:28px;">
We shortlist candidates who have successfully completed
industry-aligned learning, assessments and employability validation.
</td>
</tr>

<tr>
<td valign="top" style="font-size:22px;">✅</td>
<td style="padding-bottom:18px;color:#475569;font-size:16px;line-height:28px;">
You'll receive candidate profiles, assessment summaries,
skills and interview availability.
</td>
</tr>

<tr>
<td valign="top" style="font-size:22px;">✅</td>
<td style="color:#475569;font-size:16px;line-height:28px;">
Once you shortlist candidates, interviews can be scheduled directly
through UdaYantu.
</td>
</tr>

</table>

</td>
</tr>
</table>

</td>
</tr>

<!-- Why -->

<tr>
<td style="padding:40px;">

<h3 style="font-size:26px;color:#111827;margin-top:0;">
Why employers choose UdaYantu
</h3>

<table width="100%" cellpadding="8">

<tr>

<td width="50%" valign="top">

<div style="background:#ffffff;border:1px solid #E5E7EB;border-radius:12px;padding:20px;height:100%;">

<h4 style="margin-top:0;color:#111827;">🎯 Job-Ready Talent</h4>

<p style="color:#6B7280;line-height:26px;font-size:15px;">
Candidates are trained on practical skills, tools, aptitude,
communication and workplace readiness—not just theory.
</p>

</div>

</td>

<td width="50%" valign="top">

<div style="background:#ffffff;border:1px solid #E5E7EB;border-radius:12px;padding:20px;">

<h4 style="margin-top:0;color:#111827;">⚡ Faster Hiring</h4>

<p style="color:#6B7280;line-height:26px;font-size:15px;">
Reduce sourcing effort by receiving pre-screened candidates aligned
with your hiring criteria.
</p>

</div>

</td>

</tr>

<tr>

<td valign="top">

<div style="background:#ffffff;border:1px solid #E5E7EB;border-radius:12px;padding:20px;">

<h4 style="margin-top:0;color:#111827;">🎯 Budget Friendly</h4>

<p style="color:#6B7280;line-height:26px;font-size:15px;">
Hire quality talent without spending months on recruitment agencies
or expensive hiring campaigns.
</p>

</div>

</td>

<td valign="top">

<div style="background:#ffffff;border:1px solid #E5E7EB;border-radius:12px;padding:20px;">

<h4 style="margin-top:0;color:#111827;">📈 Scale Confidently</h4>

<p style="color:#6B7280;line-height:26px;font-size:15px;">
Whether hiring one employee or building an entire team,
UdaYantu grows with your hiring needs.
</p>

</div>

</td>

</tr>

</table>

</td>
</tr>

<!-- CTA -->

<tr>
<td align="center" style="padding:20px 40px 50px;">

<a href="${formattedDashboardUrl}"
style="background:#2563EB;
display:inline-block;
padding:18px 34px;
border-radius:10px;
text-decoration:none;
color:#ffffff;
font-size:17px;
font-weight:bold;">

Complete Company Hiring Profile

</a>

<p style="margin-top:18px;color:#6B7280;font-size:15px;line-height:26px;">
Completing your company profile helps us recommend better candidates
and reduces hiring turnaround time.
</p>

</td>
</tr>

<!-- Waitlist Info -->

<tr>
<td style="padding:0 40px 40px;">

<table width="100%" style="border:1px solid #DBEAFE;background:#EFF6FF;border-radius:12px;">
<tr>
<td style="padding:24px;">

<h3 style="margin-top:0;color:#1D4ED8;">
Your Waitlist Details
</h3>

<table width="100%">

<tr>
<td style="padding:8px 0;color:#64748B;">Company</td>
<td style="padding:8px 0;color:#111827;"><strong>${formattedCompanyName}</strong></td>
</tr>

<tr>
<td style="padding:8px 0;color:#64748B;">Hiring For</td>
<td style="padding:8px 0;color:#111827;">${formattedJobRole}</td>
</tr>

<tr>
<td style="padding:8px 0;color:#64748B;">Expected Hiring</td>
<td style="padding:8px 0;color:#111827;">${formattedHiringCount} Candidates</td>
</tr>

<tr>
<td style="padding:8px 0;color:#64748B;">Location</td>
<td style="padding:8px 0;color:#111827;">${formattedLocation}</td>
</tr>

<tr>
<td style="padding:8px 0;color:#64748B;">Submitted On</td>
<td style="padding:8px 0;color:#111827;">${formattedSubmittedDate}</td>
</tr>

<tr>
<td style="padding:8px 0;color:#64748B;">Reference ID</td>
<td style="padding:8px 0;color:#111827;"><strong>${formattedWaitlistId}</strong></td>
</tr>

</table>

</td>
</tr>
</table>

</td>
</tr>

<!-- Footer -->

<tr>
<td style="background:#F8FAFC;padding:40px;text-align:center;">

<p style="margin:0;color:#111827;font-size:18px;font-weight:bold;">
Building Careers. Empowering Businesses.
</p>

<p style="margin:18px 0;color:#64748B;font-size:15px;line-height:28px;">
Thank you for choosing UdaYantu as your hiring partner.
We look forward to helping you build a stronger workforce.
</p>

<p style="margin-top:30px;color:#94A3B8;font-size:13px;">
©️ ${emailYear} UdaYantu Technologies Pvt. Ltd.<br>
All Rights Reserved.
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>`
    });

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Error in send-email Vercel Function:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
