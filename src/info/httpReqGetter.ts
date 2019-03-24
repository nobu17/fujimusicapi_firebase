import * as functions from "firebase-functions";
import InfoGetRequest from "./data/infoGetRequest";

export default class HttpReqGetter {
  public getClassroomInfoRequest(
    req: functions.https.Request
  ): InfoGetRequest | null {
    let res: InfoGetRequest | null;

    if (
      !req.query ||
      !req.query.start ||
      typeof req.query.start !== "string" ||
      !req.query.monthCount ||
      isNaN(parseInt(req.query.monthCount))
    ) {
      res = null;
      return res;
    }
    // maxCountはオプション扱い(デフォルト10)
    let maxInfoCount = 10
    if(req.query.maxInfoCount && !isNaN(parseInt(req.query.maxInfoCount))) {
        maxInfoCount = parseInt(req.query.maxInfoCount);
    } else {
        console.log("max count is not defined.apply default value:", maxInfoCount);
    }

    res = new InfoGetRequest(req.query.start, parseInt(req.query.monthCount), maxInfoCount);
    return res;
  }
}
