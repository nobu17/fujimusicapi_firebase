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
      !req.query.end ||
      typeof req.query.end !== "string"
    ) {
      res = null;
      return res;
    }
    res = new InfoGetRequest(req.query.start, req.query.end);
    return res;
  }
}
