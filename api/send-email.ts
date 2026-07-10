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
    const { type, email, name, company, otp, mobile, role, city, message } = req.body;

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

    // Default: Welcome email
    const { data, error } = await resend.emails.send({
      from: 'UdaYantu <onboarding@resend.dev>',
      to: [email],
      bcc: ['udayantu10x@gmail.com'],
      subject: 'Welcome to UdaYantu Employer Waitlist — Priority Access Confirmed',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #1E3A63;">Welcome to UdaYantu!</h2>
          <p>Thank you for joining the UdaYantu Employer Waitlist. We are thrilled to partner with you to connect pre-trained rural talent with your organization.</p>
          <p>We will reach out to you shortly with next steps.</p>
          <br/>
          <p>Best regards,<br/>The UdaYantu Team</p>
        </div>
      `
    });

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Error in send-email Vercel Function:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
