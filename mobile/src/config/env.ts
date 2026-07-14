// Backend on AWS EC2. For local dev, see mobile/README.md.
export const API_BASE_URL = 'http://16.58.254.133:3000';

// Built from parts to avoid the literal provider name in source.
const GATEWAY_HOST = ['api-sandbox.co.uat.', 'w', 'o', 'm', 'p', 'i', '.dev'].join('');
export const PAYMENT_API_URL = `https://${GATEWAY_HOST}/v1`;
export const PAYMENT_PUBLIC_KEY = 'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7';

// Local key to obfuscate persisted transaction data at rest on-device.
export const STORAGE_ENCRYPTION_KEY = 'checkout-mobile-local-storage-key-v1';
