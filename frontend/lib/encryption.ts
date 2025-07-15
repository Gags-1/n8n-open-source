import crypto from 'crypto';

//  Constants
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;   // 128‑bit IV
const TAG_LENGTH = 16;   // 128‑bit auth tag
const SALT_LENGTH = 32;   // 256‑bit salt
const KEY_LENGTH = 32;   // 256‑bit derived key
const ITERATIONS = 100_000;

//  Helpers
const validateEncryptionKey = (): string => {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) throw new Error('ENCRYPTION_KEY or CLERK_SECRET_KEY is required');
    if (key.length < 32) throw new Error('Encryption key must be ≥ 32 characters');
    if (key === 'fallback-key-change-this') {
        console.warn('WARNING: Using default encryption key. Change this in production!');
    }
    return key;
};

const deriveKey = (password: string, salt: Buffer): Buffer =>
    crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha256');

//  Encrypt
export function encryptApiKey(text: string): string {
    if (typeof text !== 'string' || text.trim() === '') {
        throw new Error('Text to encrypt must be a non‑empty string');
    }

    const masterKey = validateEncryptionKey();
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = deriveKey(masterKey, salt);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const ciphertext = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    // Concatenate:  salt | iv | tag | ciphertext   → base64
    return Buffer.concat([salt, iv, tag, ciphertext]).toString('base64');
}

//  Decrypt
export function decryptApiKey(payload: string): string {
    if (typeof payload !== 'string' || payload.trim() === '') {
        throw new Error('Encrypted text must be a non‑empty string');
    }

    const masterKey = validateEncryptionKey();

    // ── Legacy “salt:hexCipher” format?
    if (payload.includes(':') && !payload.includes('=')) {
        console.warn('Found legacy encrypted format – re‑encrypt for better security.');
        return decryptLegacyFormat(payload, masterKey);
    }

    const data = Buffer.from(payload, 'base64');
    const min = SALT_LENGTH + IV_LENGTH + TAG_LENGTH + 1;
    if (data.length < min) throw new Error('Invalid encrypted data');

    const salt = data.subarray(0, SALT_LENGTH);
    const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = data.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const ciphertext = data.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    const key = deriveKey(masterKey, salt);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

//  Legacy decryption helpers
function decryptLegacyFormat(legacy: string, masterKey: string): string {
    const [ivHex, encHex] = legacy.split(':');
    if (!ivHex || !encHex) throw new Error('Invalid legacy format');

    const iv = Buffer.from(ivHex, 'hex');
    const ciphertext = Buffer.from(encHex, 'hex');
    const shaKey = crypto.createHash('sha256').update(masterKey).digest();

    // Validate IV length for CBC (must be 16 bytes)
    if (iv.length !== 16) {
        throw new Error(`Invalid IV length: expected 16 bytes, got ${iv.length} bytes`);
    }

    // Try GCM first (some users mis‑stored it in hex)
    try {
        // For GCM, we need to check if we have enough data for tag
        if (ciphertext.length >= TAG_LENGTH) {
            const decipher = crypto.createDecipheriv('aes-256-gcm', shaKey, iv);
            const tag = ciphertext.subarray(0, TAG_LENGTH);
            const body = ciphertext.subarray(TAG_LENGTH);
            decipher.setAuthTag(tag);
            return Buffer.concat([decipher.update(body), decipher.final()]).toString('utf8');
        }
    } catch (error) {
        console.warn('GCM decryption failed, trying CBC:', error);
    }
    
    // Fall back to CBC
    try {
        const decipher = crypto.createDecipheriv('aes-256-cbc', shaKey, iv);
        return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
    } catch (error) {
        throw new Error(`Failed to decrypt legacy format: ${error instanceof Error ? error.message : String(error)}`);
    }
}

//  Misc utilities
export const isEncrypted = (str: string): boolean => {
    if (typeof str !== 'string') return false;
    if (str.includes(':') && str.split(':').length === 2) return true;        // legacy
    try {
        const buf = Buffer.from(str, 'base64');
        return buf.length >= SALT_LENGTH + IV_LENGTH + TAG_LENGTH + 1;
    } catch {
        return false;
    }
};

export const maskApiKey = (key: string): string => {
    if (typeof key !== 'string') return '***';
    const trimmed = key.trim();
    if (trimmed.length < 8) return '***';
    return `${trimmed.slice(0, 4)}${'*'.repeat(Math.max(4, trimmed.length - 8))}${trimmed.slice(-4)}`;
};

export const secureCompare = (a: string, b: string): boolean => {
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

export const generateSecureToken = (len = 32): string =>
    crypto.randomBytes(len).toString('hex');
