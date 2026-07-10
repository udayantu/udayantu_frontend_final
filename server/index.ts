import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { setupAuth, registerAuthRoutes } from './replit_integrations/auth';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

const allowedOrigins = [
  'http://localhost:5000',
  'http://localhost:5173',
  process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(allowed => origin.includes(allowed.replace('https://', '').replace('http://', '')))) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));
app.use(express.json());

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const otpStore = new Map<string, { otp: string; expiresAt: Date; attempts: number }>();

async function startServer() {
  if (process.env.REPL_ID) {
    try {
      await setupAuth(app);
      registerAuthRoutes(app);
      console.log('Replit Auth setup successfully.');
    } catch (authError) {
      console.error('Failed to setup Replit Auth:', authError);
    }
  } else {
    console.log('Running in local development mode. Replit Auth / OIDC is disabled.');
  }

  app.post('/api/send-otp', async (req, res) => {
    try {
      const { phone } = req.body;

      if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
      }

      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: 'Invalid Indian phone number format' });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      otpStore.set(phone, { otp, expiresAt, attempts: 0 });

      if (supabase) {
        try {
          const { data: existing } = await supabase
            .from('student_registrations')
            .select('id')
            .eq('phone', phone)
            .maybeSingle();

          if (existing) {
            await supabase
              .from('student_registrations')
              .update({
                otp_code: otp,
                otp_expires_at: expiresAt.toISOString(),
                otp_status: 'unverified',
              })
              .eq('phone', phone);
          } else {
            await supabase
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
          }
        } catch (dbError: any) {
          console.log('Database operation skipped (table may not exist):', dbError.message);
        }
      }

      // Send OTP via Twilio if environment variables are configured
      const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

      let smsSent = false;
      let smsError = null;

      if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
        try {
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
          const twilioAuth = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');
          
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
            const errJson: any = await twilioResponse.json();
            console.error('Twilio sending failed:', errJson);
            smsError = errJson.message || 'Twilio API failed';
          } else {
            smsSent = true;
            console.log(`[Twilio] OTP sent successfully via SMS to ${phone}`);
          }
        } catch (err: any) {
          console.error('Error invoking Twilio locally:', err);
          smsError = err.message;
        }
      }

      console.log(`[DEV] OTP for ${phone}: ${otp}`);

      res.json({
        success: true,
        message: smsSent ? 'OTP sent successfully via SMS' : 'OTP generated successfully (sandbox mode)',
        otp: otp,
        smsSent,
        smsError
      });
    } catch (error: any) {
      console.error('Error in send-otp:', error);
      res.status(500).json({ error: error.message || 'Failed to send OTP' });
    }
  });

  app.post('/api/verify-otp', async (req, res) => {
    try {
      const { phone, otp } = req.body;

      if (!phone || !otp) {
        return res.status(400).json({ error: 'Phone and OTP are required' });
      }

      const stored = otpStore.get(phone);

      if (!stored) {
        return res.status(400).json({ error: 'OTP expired or not found. Please request a new OTP.' });
      }

      if (new Date() > stored.expiresAt) {
        otpStore.delete(phone);
        return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
      }

      if (stored.otp !== otp) {
        stored.attempts++;
        if (stored.attempts >= 5) {
          otpStore.delete(phone);
          return res.status(400).json({ error: 'Too many failed attempts. Please request a new OTP.' });
        }
        return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
      }

      otpStore.delete(phone);

      const email = `student_${phone}@udayantu.app`;
      const password = `UdaYantu_${phone}_2026!`;

      if (supabase) {
        try {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { phone, verified: true, source: 'otp_verification' }
            }
          });

          if (signUpError) {
            if (signUpError.message.includes('already registered')) {
              const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
              });

              if (signInError) {
                console.log('Sign in failed, returning demo session for development');
                return res.json({
                  success: true,
                  message: 'OTP verified (demo mode - deploy Edge Functions for production)',
                  demoMode: true,
                  session: { access_token: null, refresh_token: null },
                  user: { id: `demo_${phone}`, phone, email },
                });
              }

              return res.json({
                success: true,
                message: 'OTP verified successfully',
                session: signInData.session,
                user: signInData.user,
              });
            }

            console.log('SignUp error:', signUpError.message);
            return res.json({
              success: true,
              message: 'OTP verified (demo mode)',
              demoMode: true,
              session: { access_token: null, refresh_token: null },
              user: { id: `demo_${phone}`, phone, email },
            });
          }

          if (signUpData.session) {
            return res.json({
              success: true,
              message: 'OTP verified and account created',
              session: signUpData.session,
              user: signUpData.user,
            });
          }

          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError) {
            return res.json({
              success: true,
              message: 'OTP verified - please check email for confirmation',
              demoMode: true,
              session: { access_token: null, refresh_token: null },
              user: signUpData.user || { id: `demo_${phone}`, phone, email },
            });
          }

          return res.json({
            success: true,
            message: 'OTP verified successfully',
            session: signInData.session,
            user: signInData.user,
          });
        } catch (authError) {
          console.error('Auth error:', authError);
          return res.json({
            success: true,
            message: 'OTP verified (demo mode)',
            demoMode: true,
            session: { access_token: null, refresh_token: null },
            user: { id: `demo_${phone}`, phone },
          });
        }
      } else {
        return res.json({
          success: true,
          message: 'OTP verified (demo mode)',
          demoMode: true,
          session: { access_token: null, refresh_token: null },
          user: { id: `demo_${phone}`, phone },
        });
      }
    } catch (error: any) {
      console.error('Error in verify-otp:', error);
      res.status(500).json({ error: error.message || 'Failed to verify OTP' });
    }
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
