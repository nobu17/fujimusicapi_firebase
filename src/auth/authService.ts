import * as functions from "firebase-functions";
import LoginRequest from "./data/LoginRequest";
import { AuthResult, AuthErrorType } from "./data/AuthResult";
import { AuthDataRepository } from "./authDataRepository";
import * as jwt from "jsonwebtoken";

export default class AuthService {
  private repository: AuthDataRepository;
  private secretKey: string;
  private tokenExpHour: string;
  constructor() {
    this.repository = new AuthDataRepository();
    this.secretKey = functions.config().auth.seckey;
    this.tokenExpHour = "24h";
    //console.log("seckey", this.secretKey);
  }

  async getAuthResult(req: LoginRequest): Promise<AuthResult> {
    // 入力チェック
    const message = req.validateParam();
    if (message !== "") {
      //入力エラー
      console.error("input validation error", message);
      return new AuthResult("", "", "", message, AuthErrorType.paramError);
    }
    const users = await this.repository.getUserList();
    console.log("users", users);
    if (users) {
      // ユーザIDが一致するものがあるかどうか
      const targetUser = users.findUser(req.getUserId());
      if (targetUser) {
        //パスワードの検証
        if (targetUser.password === req.getPassword()) {
          // jwtでトークン発行
          const token = jwt.sign(
            { userId: targetUser.userId },
            this.secretKey,
            { algorithm: "HS256", expiresIn: this.tokenExpHour }
          );
          return new AuthResult(
            targetUser.userId,
            targetUser.role,
            token,
            "",
            AuthErrorType.none
          );
        } else {
          return new AuthResult(
            "",
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
          "",
          "no match user:" + req.getUserId(),
          AuthErrorType.noUser
        );
      }
      //return new AuthResult("", "", message, AuthErrorType.none);
    } else {
      return new AuthResult(
        "",
        "",
        "",
        "storage error",
        AuthErrorType.exception
      );
    }
  }
}
