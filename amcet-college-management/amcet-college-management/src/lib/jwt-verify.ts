export interface JwtPayload {
  userId: string;
  collegeId: string;
  name: string;
  role: 'PRIMARY_ADMIN' | 'SECONDARY_ADMIN' | 'FACULTY' | 'STUDENT';
  studentId?: string;
  facultyId?: string;
  exp?: number;
  iat?: number;
}

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function verifyJwtWebCrypto(
  token: string,
  secret: string
): Promise<JwtPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    // Decode header and verify algorithm
    const headerStr = new TextDecoder().decode(base64UrlToUint8Array(headerB64));
    const header = JSON.parse(headerStr);
    if (header.alg !== 'HS256') {
      return null;
    }

    // Decode payload
    const payloadStr = new TextDecoder().decode(base64UrlToUint8Array(payloadB64));
    const payload: JwtPayload = JSON.parse(payloadStr);

    // Verify expiration
    if (payload.exp && Math.floor(Date.now() / 1000) >= payload.exp) {
      return null;
    }

    // Cryptographically verify signature using Web Crypto HMAC-SHA256
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const signature = base64UrlToUint8Array(signatureB64);

    const isValid = await crypto.subtle.verify('HMAC', key, signature, data);
    if (!isValid) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
