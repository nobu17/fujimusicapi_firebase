import * as functions from "firebase-functions";
import { ITopPageRequest, TopPageImagePostRequest } from "./data/topPageRequest";

export default class HttpReqGetter {
  public getClassroomInfoRequest(
    req: functions.https.Request
  ): ITopPageRequest | null {
    let res: ITopPageRequest | null;
    res = null;
    const contentType = req.get("content-type") as string;
    if (contentType.startsWith("multipart/form-data")) {
        res = new TopPageImagePostRequest(req);
    }
    return res;
  }
}
