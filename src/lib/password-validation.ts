export type PasswordStrength = 'weak' | 'moderate' | 'strong' | 'very_strong';

export interface PasswordRule {
  key: string;
  test: (pw: string) => boolean;
}

const COMMON_PASSWORDS = [
  'password', '12345678', '123456789', '1234567890', 'qwerty', 'abc123',
  'password1', 'kivara123', 'kivara2026', 'letmein', 'welcome', 'admin',
  'iloveyou', 'monkey', 'dragon', 'master', 'login', 'princess',
];

export const PASSWORD_RULES: PasswordRule[] = [
  { key: 'minLength', test: (pw) => pw.length >= 12 },
  { key: 'uppercase', test: (pw) => /[A-Z]/.test(pw) },
  { key: 'lowercase', test: (pw) => /[a-z]/.test(pw) },
  { key: 'number', test: (pw) => /[0-9]/.test(pw) },
  { key: 'special', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

export function checkPasswordRules(password: string) {
  return PASSWORD_RULES.map((rule) => ({
    key: rule.key,
    passed: rule.test(password),
  }));
}

export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.includes(password.toLowerCase());
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password || password.length === 0) return 'weak';
  if (isCommonPassword(password)) return 'weak';

  const results = checkPasswordRules(password);
  const passed = results.filter((r) => r.passed).length;

  if (passed <= 2) return 'weak';
  if (passed === 3) return 'moderate';
  if (passed === 4) return 'strong';
  return 'very_strong';
}

export function isPasswordValid(password: string): boolean {
  if (isCommonPassword(password)) return false;
  return PASSWORD_RULES.every((rule) => rule.test(password));
}
