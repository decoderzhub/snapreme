export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

async function sha1(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.toUpperCase();
}

async function checkPwnedPassword(password: string): Promise<boolean> {
  try {
    const hash = await sha1(password);
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    const text = await response.text();

    const hashes = text.split('\n');
    const found = hashes.some(line => line.startsWith(suffix));

    return found;
  } catch (err) {
    console.error('Error checking pwned passwords:', err);
    return false;
  }
}

export async function validatePassword(password: string): Promise<PasswordValidationResult> {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must be no more than 128 characters long');
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  const characterTypeCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;

  if (characterTypeCount < 3) {
    errors.push('Password must contain at least 3 of the following: uppercase letters, lowercase letters, numbers, or special characters');
  }

  const commonPasswords = [
    'password', '12345678', 'qwerty', 'abc123', 'monkey',
    '1234567890', 'letmein', 'trustno1', 'dragon', 'baseball',
    'iloveyou', 'master', 'sunshine', 'ashley', 'bailey',
    'passw0rd', 'shadow', '123123', '654321', 'superman',
    'qazwsx', 'michael', 'football'
  ];

  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Password contains common words or patterns');
  }

  const repeatingChars = /(.)\1{2,}/.test(password);
  if (repeatingChars) {
    errors.push('Password contains too many repeating characters');
  }

  const sequential = /(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password);
  if (sequential) {
    errors.push('Password contains sequential characters');
  }

  if (errors.length === 0) {
    const isPwned = await checkPwnedPassword(password);
    if (isPwned) {
      errors.push('This password has been found in a data breach. Please choose a different password');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function getPasswordStrengthIndicator(password: string): {
  strength: 'weak' | 'fair' | 'good' | 'strong';
  score: number;
  color: string;
} {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const uniqueChars = new Set(password).size;
  if (uniqueChars >= 8) score += 1;

  if (score <= 3) {
    return { strength: 'weak', score, color: 'red' };
  } else if (score <= 5) {
    return { strength: 'fair', score, color: 'orange' };
  } else if (score <= 7) {
    return { strength: 'good', score, color: 'yellow' };
  } else {
    return { strength: 'strong', score, color: 'green' };
  }
}
