const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export type StoredUser = {
  id: string;
  name: string;
  email: string;
};

async function request(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'API error');
  return data;
}

export async function createUser(name: string, email: string, password: string): Promise<boolean> {
  try {
    const data = await request('/auth/signup', { method: 'POST', body: JSON.stringify({ username: name, email, password }) });
    return !!data.ok;
  } catch (e) {
    return false;
  }
}

export async function verifyUser(email: string, password: string): Promise<any | null> {
  try {
    const data = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    // data contains token and user
    return { id: data.user.id, name: data.user.username, email: data.user.email, token: data.token };
  } catch (e) {
    return null;
  }
}

export async function changePassword(email: string, current: string, next: string): Promise<boolean> {
  try {
    const data = await request('/auth/change-password', { method: 'POST', body: JSON.stringify({ email, current, next }) });
    return !!data.ok;
  } catch (e) {
    return false;
  }
}

export async function deleteUserByEmail(email: string) {
  try {
    await request('/auth/delete-account', { method: 'POST', body: JSON.stringify({ email }) });
  } catch (e) {
    // ignore
  }
}

export async function getUserByEmail(email: string): Promise<any | null> {
  try {
    // Not exposing a dedicated endpoint; reuse login-less lookup (not ideal but minimal)
    return null;
  } catch (e) {
    return null;
  }
}

export async function mfaGenerate(email: string) {
  try {
    const data = await request('/mfa/generate', { method: 'POST', body: JSON.stringify({ email }) });
    return data;
  } catch (e) {
    return null;
  }
}

export async function mfaVerify(email: string, otp: string) {
  try {
    const data = await request('/mfa/verify', { method: 'POST', body: JSON.stringify({ email, otp }) });
    return !!data.ok;
  } catch (e) {
    return false;
  }
}

export async function updateEmergencyContacts(email: string, emergencyContacts: { name: string; phone: string }[]) {
  try {
    const data = await request('/auth/update-emergency', { method: 'POST', body: JSON.stringify({ email, emergencyContacts }) });
    return data;
  } catch (e) {
    return null;
  }
}

export async function updateFlags(email: string, flags: { mfaEnabled?: boolean; biometricEnabled?: boolean }) {
  try {
    const data = await request('/auth/update-flags', { method: 'POST', body: JSON.stringify({ email, ...flags }) });
    return data;
  } catch (e) {
    return null;
  }
}

export async function webauthnRegisterOptions(email: string) {
  try {
    return await request('/webauthn/register/options', { method: 'POST', body: JSON.stringify({ email }) });
  } catch (e) {
    return null;
  }
}

export async function webauthnRegisterVerify(email: string, id: string) {
  try {
    return await request('/webauthn/register/verify', { method: 'POST', body: JSON.stringify({ email, id }) });
  } catch (e) {
    return null;
  }
}

export async function webauthnAssertOptions(email: string) {
  try {
    return await request('/webauthn/assert/options', { method: 'POST', body: JSON.stringify({ email }) });
  } catch (e) {
    return null;
  }
}

export async function webauthnAssertVerify(email: string, id: string) {
  try {
    return await request('/webauthn/assert/verify', { method: 'POST', body: JSON.stringify({ email, id }) });
  } catch (e) {
    return null;
  }
}

export default {};
