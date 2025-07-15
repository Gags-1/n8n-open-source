import { encryptApiKey, decryptApiKey, isEncrypted } from './encryption';

// Define sensitive fields that need encryption
const SENSITIVE_FIELDS = new Set([
  'apiKey',
  'password',
  'username', // for email
  'webhookUrl', // might contain auth tokens
]);

/**
 * Recursively encrypt sensitive fields in node data
 */
export function encryptNodeData(nodeData: any): any {
  if (!nodeData || typeof nodeData !== 'object') return nodeData;
  
  const encrypted = { ...nodeData };
  
  for (const [key, value] of Object.entries(encrypted)) {
    if (typeof value === 'string' && SENSITIVE_FIELDS.has(key)) {
      // Only encrypt if not already encrypted and not empty
      if (value && !isEncrypted(value)) {
        try {
          encrypted[key] = encryptApiKey(value);
        } catch (error) {
          console.error(`Failed to encrypt ${key}:`, error);
          // Keep original value if encryption fails
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      // Recursively handle nested objects
      encrypted[key] = encryptNodeData(value);
    }
  }
  
  return encrypted;
}

/**
 * Recursively decrypt sensitive fields in node data
 */
export function decryptNodeData(nodeData: any): any {
  if (!nodeData || typeof nodeData !== 'object') return nodeData;
  
  const decrypted = { ...nodeData };
  
  for (const [key, value] of Object.entries(decrypted)) {
    if (typeof value === 'string' && SENSITIVE_FIELDS.has(key)) {
      // Decrypt if encrypted
      if (value && isEncrypted(value)) {
        try {
          decrypted[key] = decryptApiKey(value);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`Failed to decrypt ${key}:`, {
            error: errorMessage,
            valueLength: value.length,
            valueFormat: value.includes(':') ? 'legacy' : 'modern',
            isBase64: /^[A-Za-z0-9+/]*={0,2}$/.test(value)
          });
          
          // For corrupted legacy data, try to handle gracefully
          if (errorMessage.includes('Invalid IV length')) {
            console.warn(`Clearing corrupted legacy encrypted data for field: ${key}`);
            decrypted[key] = ''; // Clear corrupted data
          } else {
            // For other errors, keep the encrypted value and log for manual investigation
            console.warn(`Keeping encrypted value for manual investigation: ${key}`);
            decrypted[key] = value;
          }
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      // Recursively handle nested objects
      decrypted[key] = decryptNodeData(value);
    }
  }
  
  return decrypted;
}

/**
 * Process all nodes in a workflow to encrypt sensitive data
 */
export function encryptWorkflowNodes(nodes: any[]): any[] {
  return nodes.map(node => ({
    ...node,
    data: encryptNodeData(node.data)
  }));
}

/**
 * Process all nodes in a workflow to decrypt sensitive data
 */
export function decryptWorkflowNodes(nodes: any[]): any[] {
  return nodes.map(node => ({
    ...node,
    data: decryptNodeData(node.data)
  }));
}