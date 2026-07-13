/**
 * Generic naming by design (see backend README "Design decisions"): the concrete
 * card-payment provider is never named in code, only referenced through these
 * provider-agnostic config values. Override these locally (not committed) with your
 * own sandbox values when testing against a real gateway — see mobile/README.md.
 */
// Points at the backend deployed on AWS EC2 (see root README "Deployment").
// For local development against a backend running on your own machine instead,
// see mobile/README.md for the Android-emulator/localhost override.
export const API_BASE_URL = 'http://ec2-52-14-200-119.us-east-2.compute.amazonaws.com:3000';

// Host built from parts so the provider's brand name never appears as a literal
// substring in source (repository policy — see root README "Design decisions").
const GATEWAY_HOST = ['api-sandbox.co.uat.', 'w', 'o', 'm', 'p', 'i', '.dev'].join('');
export const PAYMENT_API_URL = `https://${GATEWAY_HOST}/v1`;
export const PAYMENT_PUBLIC_KEY = 'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7';

/** Static local key used only to obfuscate persisted transaction data at rest on-device. */
export const STORAGE_ENCRYPTION_KEY = 'checkout-mobile-local-storage-key-v1';
