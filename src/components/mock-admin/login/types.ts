/**
 * Login handlers. The screen only knows these outcomes; login-page.tsx maps the API (contract §1
 * A1–A3) onto them.
 */
export type PasswordResult =
  /** password ok, TOTP code required */
  | { kind: 'code' }
  /** password ok, 2FA not set up yet → enrollment (QR + secret + first code) */
  | { kind: 'enroll' }
  | { kind: 'wrong'; triesLeft: number }
  | { kind: 'locked' }
  /** any other refusal, already worded */
  | { kind: 'error'; text: string };

export type CodeResult =
  | { kind: 'ok' }
  | { kind: 'expired' }
  | { kind: 'invalid' }
  /** the challenge is gone: back to the password step with this text */
  | { kind: 'restart'; text: string }
  | { kind: 'locked' }
  | { kind: 'error'; text: string };

export interface EnrollData { secret: string; qrSvg: string }

export interface AdminLoginHandlers {
  submitPassword(email: string, password: string): Promise<PasswordResult>;
  /** A2: QR + secret for the enrollment step */
  startEnroll(): Promise<EnrollData>;
  submitCode(code: string): Promise<CodeResult>;
  /** after a successful code: where to go */
  done(): void;
}
