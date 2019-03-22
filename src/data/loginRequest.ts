import IAuthReqData from "./IAuthReqData";

export default class LoginRequest implements IAuthReqData {
  private userId: string;
  private password: string;

  constructor(userId: string, password: string) {
    this.userId = userId;
    this.password = password;
  }

  public getUserId() {
    return this.userId;
  }

  public getPassword() {
    return this.password;
  }

  // パラメータチェック。不正の場合エラーメッセージを返す
  public validateParam(): string {
    if (!this.userId || this.userId.trim() === "") {
      return "userId is empty";
    } else if (!this.password || this.password.trim() === "") {
      return "password is empty";
    } else {
      return "";
    }
  }
}
