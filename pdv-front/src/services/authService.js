import api from './api';

// ── Helpers base64url ────────────────────────────────────────────────────────

function bufToB64url(buf) {
  const bytes = new Uint8Array(buf);
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function b64urlToBuf(b64url) {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

// ── Auth tradicional ─────────────────────────────────────────────────────────

export async function loginComSenha(senha) {
  const data = await api.post('/auth/login', { senha });
  return data.token;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('biometria_ativa');
}

export function isLoggedIn() {
  return !!localStorage.getItem('token');
}

// ── WebAuthn ─────────────────────────────────────────────────────────────────

export function isBiometriaSuportada() {
  return typeof window !== 'undefined' && !!window.PublicKeyCredential;
}

export function isBiometriaAtiva() {
  return localStorage.getItem('biometria_ativa') === 'true';
}

export async function registrarBiometria() {
  const opts = await api.get('/webauthn/register/options');

  // Converte campos byte[] de base64url → ArrayBuffer
  const publicKey = {
    ...opts,
    challenge: b64urlToBuf(opts.challenge),
    user: { ...opts.user, id: b64urlToBuf(opts.user.id) },
    excludeCredentials: (opts.excludeCredentials ?? []).map(c => ({
      ...c, id: b64urlToBuf(c.id),
    })),
  };

  const cred = await navigator.credentials.create({ publicKey });
  if (!cred) throw new Error('Biometria cancelada pelo usuário.');

  const body = {
    id: cred.id,
    rawId: bufToB64url(cred.rawId),
    type: cred.type,
    response: {
      attestationObject: bufToB64url(cred.response.attestationObject),
      clientDataJSON: bufToB64url(cred.response.clientDataJSON),
    },
    extensions: cred.getClientExtensionResults?.() ?? {},
  };

  await api.post('/webauthn/register/verify', body);
  localStorage.setItem('biometria_ativa', 'true');
}

export async function loginComBiometria() {
  const opts = await api.get('/webauthn/login/options');

  const publicKey = {
    ...opts,
    challenge: b64urlToBuf(opts.challenge),
    allowCredentials: (opts.allowCredentials ?? []).map(c => ({
      ...c, id: b64urlToBuf(c.id),
    })),
  };

  const cred = await navigator.credentials.get({ publicKey });
  if (!cred) throw new Error('Biometria cancelada pelo usuário.');

  const body = {
    id: cred.id,
    rawId: bufToB64url(cred.rawId),
    type: cred.type,
    response: {
      authenticatorData: bufToB64url(cred.response.authenticatorData),
      clientDataJSON: bufToB64url(cred.response.clientDataJSON),
      signature: bufToB64url(cred.response.signature),
      userHandle: cred.response.userHandle ? bufToB64url(cred.response.userHandle) : null,
    },
    extensions: cred.getClientExtensionResults?.() ?? {},
  };

  const data = await api.post('/webauthn/login/verify', body);
  return data.token;
}

export async function verificarStatusBiometria() {
  try {
    const data = await api.get('/webauthn/status');
    return data.registrado;
  } catch {
    return false;
  }
}
