import * as functions from "firebase-functions";

export default class Common {
  // 認証されたリクエストか判断します
  public static IsAuthrizedRequest(
    req: functions.https.Request,
    apiKey: string
  ): boolean {
    const request_key = req.get("authorization");
    if (request_key && request_key === apiKey) {
      return true;
    }
    return false;
  }
  // 指定ミリ秒待機
  public static async sleep(t: number) {
    return await new Promise(r => {
      setTimeout(() => {
        r();
      }, t);
    });
  }
}
