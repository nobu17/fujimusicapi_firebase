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

  // str: 日付文字列（yyyy-MM-dd, yyyy/MM/dd）
  // delim: 区切り文字（"-", "/"など）
  public static isDate(str: string, delim: string) {
    const arr = str.split(delim);
    if (arr.length !== 3) return false;
    const date = new Date(parseInt(arr[0]), parseInt(arr[1]) - 1, parseInt(arr[2]));
    if (
      arr[0] !== String(date.getFullYear()) ||
      arr[1] !== ("0" + (date.getMonth() + 1)).slice(-2) ||
      arr[2] !== ("0" + date.getDate()).slice(-2)
    ) {
      return false;
    } else {
      return true;
    }
  }
}
