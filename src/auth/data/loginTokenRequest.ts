import IAuthReqData from "./IAuthReqData";

export default class LoginTokenRequest implements IAuthReqData {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }
  public getToken() {
    return this.token;
  }

  // パラメータチェック。不正の場合エラーメッセージを返す
  public validateParam(): string {
    if (!this.token || this.token.trim() === "") {
      return "token is empty";
    } else {
      return "";
    }
  }
}
