
import * as functions from "firebase-functions";
import ClassroomInfoRequest from "./data/classroomInfoRequest";


export default class HttpReqGetter {
  public getClassroomInfoRequest (req: functions.https.Request): ClassroomInfoRequest | null {
    let res: ClassroomInfoRequest | null;

    if(!req.query || !req.query.classNames || typeof req.query.classNames !== "string") {
        res = null;
        return res;
    }
    res = new ClassroomInfoRequest(req.query.classNames);
    return res;
  }

}
