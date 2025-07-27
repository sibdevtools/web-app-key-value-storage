import { Base64 } from '@sibdevtools/frontend-common';

/**
 * Try to decode base64 to text
 * @param base64 base64 text
 */
export const tryDecodeToText = (base64: string | null): string => {
  if (!base64) {
    return ''
  }
  try {
    return Base64.Decoder.text2text(base64)
  } catch (error) {
    console.error('Failed to decode base64 to text:', error);
    return 'Not a valid base64 string';
  }
};
