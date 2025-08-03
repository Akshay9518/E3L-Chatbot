// authUtils.js

// Utility: ArrayBuffer ↔ Base64
export const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return window.btoa(binary);
};

export const base64ToArrayBuffer = (base64) => {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};


export const encryptData = async (data) => {
  if (!window.crypto || !window.crypto.subtle || !window.crypto.subtle.generateKey) {
    console.warn('Web Crypto API not available – skipping encryption');
    return {
      encrypted: JSON.stringify(data),
      iv: null,
      key: null,
    };
  }
 
  const encoder = new TextEncoder();
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedData = encoder.encode(JSON.stringify(data));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedData
  );
  const exportedKey = await crypto.subtle.exportKey('raw', key);
  return {
    encrypted: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv.buffer),
    key: arrayBufferToBase64(exportedKey),
  };
};
export const decryptData = async ({ encrypted, iv, key }) => {
  try {
    const decoder = new TextDecoder();
    const keyBuffer = base64ToArrayBuffer(key);
    const ivBuffer = base64ToArrayBuffer(iv);
    const encryptedBuffer = base64ToArrayBuffer(encrypted);
    const importedKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBuffer },
      importedKey,
      encryptedBuffer
    );
    return JSON.parse(decoder.decode(decrypted));
  } catch (err) {
    console.error('Decryption error:', err);
    throw err;
  }
};

export const decryptAuthData = async ({ encrypted, iv, key }) => {
  try {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      base64ToArrayBuffer(key),
      'AES-GCM',
      true,
      ['decrypt']
    );
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(base64ToArrayBuffer(iv)),
      },
      cryptoKey,
      base64ToArrayBuffer(encrypted)
    );
    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decrypted));
  } catch (err) {
    console.error('Error decrypting authData:', err);
    return null;
  }
};

export const getDecryptedAuthData = async () => {
  const storedAuthData = localStorage.getItem('authData');
  if (!storedAuthData) {
    return { userId: null, token: null, email: null, displayName: null };
  }
  const encryptedAuthData = JSON.parse(storedAuthData);
  const decryptedAuthData = await decryptAuthData(encryptedAuthData);
  return {
    userId: decryptedAuthData?.userId || null,
    token: decryptedAuthData?.token || null,
    email: decryptedAuthData?.email || null,
    displayName: decryptedAuthData?.displayName || null,
  };
};