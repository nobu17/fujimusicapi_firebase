import LoginRequest from "./data/LoginRequest";
import { AuthResult, AuthErrorType } from "./data/AuthResult";
import { AuthDataRepository } from "./authDataRepository";

export default class AuthService {
  private repository: AuthDataRepository;
  constructor() {
    this.repository = new AuthDataRepository();
  }

  async getAuthResult(req: LoginRequest): Promise<AuthResult> {
    // 入力チェック
    const message = req.validateParam();
    if (message !== "") {
      //入力エラー
      console.error("input validation error", message);
      return new AuthResult("", "", message, AuthErrorType.paramError);
    }
    const users = await this.repository.getUserList();
    console.log("users", users);
    if (users) {
      // ユーザIDが一致するものがあるかどうか
      const targetUser = users.findUser(req.getUserId());
      if (targetUser) {
        //パスワードの検証
        if (targetUser.password === req.getPassword()) {
          return new AuthResult(
            targetUser.userId,
            targetUser.role,
            "",
            AuthErrorType.none
          );
        } else {
          return new AuthResult(
            "",
            "",
            "password is not match",
            AuthErrorType.authError
          );
        }
      } else {
        return new AuthResult(
          "",
          "",
          "no match user:" + req.getUserId(),
          AuthErrorType.noUser
        );
      }
      //return new AuthResult("", "", message, AuthErrorType.none);
    } else {
      return new AuthResult("", "", "storage error", AuthErrorType.exception);
    }
  }
}
