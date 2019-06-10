import * as functions from "firebase-functions";
import LoginRequest from "./data/LoginRequest";
import LoginTokenRequest from "./data/loginTokenRequest";
import { AuthResult, AuthErrorType } from "./data/AuthResult";
import { AuthDataRepository } from "./authDataRepository";
import * as jwt from "jsonwebtoken";

export default class AuthService {
  private repository: AuthDataRepository;
  private secretKey: string;
  private tokenExpHour: string;
  private cryptAlgorithm: string;
  constructor() {
    this.repository = new AuthDataRepository();
    this.secretKey = functions.config().auth.seckey;
    this.tokenExpHour = "7d";
    this.cryptAlgorithm = "HS256";
    //console.log("seckey", this.secretKey);
  }
  // Tokenによる認証
  async getAuthResultByToken(req: LoginTokenRequest): Promise<AuthResult> {
    // 入力チェック
    const message = req.validateParam();
    if (message !== "") {
      //入力エラー
      console.error("input validation error", message);
      return new AuthResult("", "", "", message, AuthErrorType.paramError);
    }
    // jwtによるトークン
    let decodeUser;
    try {
      decodeUser = jwt.verify(req.getToken(), this.secretKey, {
        algorithms: [this.cryptAlgorithm]
      }) as any;
    } catch (err) {
      console.error("token decode error", err);
      // トークン切れの場合
      if (err.name === "TokenExpiredError") {
        return new AuthResult(
          "",
          "",
          "",
          "token is expired",
          AuthErrorType.tokenExpired
        );
      } else {
        return new AuthResult(
          "",
          "",
          "",
          "token decode error",
          AuthErrorType.tokenError
        );
      }
    }
    if (
      decodeUser &&
      typeof decodeUser === "object" &&
      typeof decodeUser.userId === "string"
    ) {
      // トークン内のユーザと認証
      const users = await this.repository.getUserList();
      if (users) {
        const targetUser = users.findUser(decodeUser.userId);
        if (targetUser) {
          return new AuthResult(
            targetUser.userId,
            targetUser.role,
            req.getToken(),
            "",
            AuthErrorType.none
          );
        } else {
          // トークン内のユーザと一致しなければアウト
          return new AuthResult(
            "",
            "",
            "",
            "no match user:" + decodeUser.userId,
            AuthErrorType.noUser
          );
        }
      } else {
        return new AuthResult(
          "",
          "",
          "",
          "storage error",
          AuthErrorType.exception
        );
      }
    } else {
      console.error("token decode class is not object");
      return new AuthResult(
        "",
        "",
        "",
        "token decode class is not object",
        AuthErrorType.paramError
      );
    }
  }
  // パスワードによる認証
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
            { algorithm: this.cryptAlgorithm, expiresIn: this.tokenExpHour }
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
