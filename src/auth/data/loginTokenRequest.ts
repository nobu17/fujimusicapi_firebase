import IAuthReqData from "./IAuthReqData";

export default class LoginTokenRequest implements IAuthReqData {
  private userId: string;
  private token: string;

  constructor(userId: string, token: string) {
    this.userId = userId;
    this.token = token;
  }

  public getUserId() {
    return this.userId;
  }

  public getToken() {
    return this.token;
  }

  // パラメータチェック。不正の場合エラーメッセージを返す
  public validateParam(): string {
    if (!this.userId || this.userId.trim() === "") {
      return "userId is empty";
    } else if (!this.token || this.token.trim() === "") {
      return "token is empty";
    } else {
      return "";
    }
  }
}
