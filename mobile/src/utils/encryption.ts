import { STORAGE_ENCRYPTION_KEY } from '../config/env';

/**
 * React Native/Hermes has no `btoa`/`atob` globals (those are browser/Node APIs),
 * so base64 is encoded/decoded manually here instead of pulling in a polyfill.
 */
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function codePointOf(char: string): number {
  return char.codePointAt(0) ?? 0;
}

function base64Encode(binary: string): string {
  let result = '';
  let i = 0;
  for (; i + 2 < binary.length; i += 3) {
    const chunk =
      (codePointOf(binary[i]) << 16) | (codePointOf(binary[i + 1]) << 8) | codePointOf(binary[i + 2]);
    result += BASE64_CHARS[(chunk >> 18) & 0x3f];
    result += BASE64_CHARS[(chunk >> 12) & 0x3f];
    result += BASE64_CHARS[(chunk >> 6) & 0x3f];
    result += BASE64_CHARS[chunk & 0x3f];
  }
  const remaining = binary.length - i;
  if (remaining === 1) {
    const chunk = codePointOf(binary[i]) << 16;
    result += BASE64_CHARS[(chunk >> 18) & 0x3f] + BASE64_CHARS[(chunk >> 12) & 0x3f] + '==';
  } else if (remaining === 2) {
    const chunk = (codePointOf(binary[i]) << 16) | (codePointOf(binary[i + 1]) << 8);
    result += BASE64_CHARS[(chunk >> 18) & 0x3f] + BASE64_CHARS[(chunk >> 12) & 0x3f] + BASE64_CHARS[(chunk >> 6) & 0x3f] + '=';
  }
  return result;
}

function stripTrailingPadding(encoded: string): string {
  let end = encoded.length;
  while (end > 0 && encoded[end - 1] === '=') {
    end -= 1;
  }
  return encoded.slice(0, end);
}

function base64Decode(encoded: string): string {
  const clean = stripTrailingPadding(encoded);
  let result = '';
  let buffer = 0;
  let bits = 0;
  for (const char of clean) {
    const value = BASE64_CHARS.indexOf(char);
    if (value === -1) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      result += String.fromCodePoint((buffer >> bits) & 0xff);
    }
  }
  return result;
}

function getDerivedKey(): number[] {
  const key: number[] = [];
  for (const char of STORAGE_ENCRYPTION_KEY) {
    key.push(codePointOf(char) % 256);
  }
  return key;
}

function xorEncode(data: number[], key: number[]): number[] {
  return data.map((byte, i) => byte ^ key[i % key.length]);
}

function numberToBytes(n: number): number[] {
  return [(n >> 24) & 0xff, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function bytesToNumber(bytes: number[]): number {
  return ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
}

export function encryptForStorage(value: unknown): string {
  const json = JSON.stringify(value);
  const bytes: number[] = [];
  for (const char of json) {
    bytes.push(codePointOf(char) & 0xff);
  }
  const key = getDerivedKey();
  const encoded = xorEncode(bytes, key);
  const checksum = numberToBytes(bytes.length);
  const payload = [...checksum, ...encoded];
  return base64Encode(String.fromCodePoint(...payload));
}

export function decryptFromStorage<T>(ciphertext: string): T | null {
  try {
    const raw = base64Decode(ciphertext);
    const payload: number[] = [];
    for (const char of raw) {
      payload.push(codePointOf(char));
    }
    if (payload.length < 4) return null;
    const originalLength = bytesToNumber(payload.slice(0, 4));
    const encoded = payload.slice(4);
    const key = getDerivedKey();
    const decoded = xorEncode(encoded, key);
    const json = String.fromCodePoint(...decoded.slice(0, originalLength));
    if (!json) return null;
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
