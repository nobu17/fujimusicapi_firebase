import * as functions from "firebase-functions";

export interface ITopPageRequest {
  getMethodType(): string;
}

// 画像アップロード用
export class TopPageImagePostRequest implements ITopPageRequest {
  constructor(public req: functions.https.Request) {}

  public getMethodType(): string {
    return "topImage";
  }
}