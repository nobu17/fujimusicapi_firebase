export class AuthResult {
  constructor(
    public userId: string,
    public role: string,
    public token: string,
    public errorMessage: string,
    public errorType: AuthErrorType
  ) {}
}

export enum AuthErrorType {
  none,
  paramError,
  noUser,
  authError,
  exception
}
