/**
 * Login handlers (admin-mock auth). The screen only knows these outcomes; the API adapter maps
 * Bekzod's contract (.claude/specs/mock-admin/_api-contract.md) onto them.
 */
export type PasswordResult =
  /** password ok, 2FA code required */
  | { kind: 'code' }
  /** password ok and no 2FA step (session already issued) */
  | { kind: 'ok' }
  | { kind: 'wrong'; triesLeft: number }
  | { kind: 'locked' };

export type CodeResult =
  | { kind: 'ok' }
  | { kind: 'expired' }
  /** wrong code (not expired) */
  | { kind: 'invalid' }
  /** the password step has to be repeated (challenge gone) */
  | { kind: 'restart' }
  | { kind: 'locked' };

export interface AdminLoginHandlers {
  submitPassword(email: string, password: string): Promise<PasswordResult>;
  submitCode(code: string): Promise<CodeResult>;
}
