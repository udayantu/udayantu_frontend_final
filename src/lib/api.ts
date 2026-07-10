const API_BASE_URL = '';

export const sendOtp = async (phone: string) => {
  const response = await fetch(`${API_BASE_URL}/api/send-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to send OTP');
  }

  return data;
};

export const verifyOtp = async (phone: string, otp: string) => {
  const response = await fetch(`${API_BASE_URL}/api/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone, otp }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to verify OTP');
  }

  return data;
};
