import * as functions from "firebase-functions";
import ClassroomInfoRequest from "./data/classroomInfoRequest";
import {
  IClassroomPost,
  ClassroomInfoPostRequest,
  ClassroomImagePostRequest,
  ClassroomInfo
} from "./data/classroomPostRequest";

export default class HttpReqGetter {
  public getClassroomInfoRequest(
    req: functions.https.Request
  ): ClassroomInfoRequest | null {
    let res: ClassroomInfoRequest | null;

    if (
      !req.query ||
      !req.query.classNames ||
      typeof req.query.classNames !== "string"
    ) {
      res = null;
      return res;
    }
    res = new ClassroomInfoRequest(req.query.classNames);
    return res;
  }
  public getClassroomPostRequest(
    req: functions.https.Request
  ): IClassroomPost | null {
    let res: IClassroomPost | null;
    const contentType = req.get("content-type") as string;
    if (contentType === "application/json") {
      res = this.getInfoPostRequestParam(req.body);
    } else if (contentType.startsWith("multipart/form-data")) {
      res = this.getInfoImageRequestParam(req);
    } else {
      res = null;
    }
    return res;
  }

  private getInfoPostRequestParam(body: any): ClassroomInfoPostRequest | null {
    if (
      typeof body === "object" &&
      Array.isArray(body.classList) &&
      body.classList.every((x: any) => typeof x === "object")
    ) {
      const classList = new Array<ClassroomInfo>();
      for (const cla of body.classList) {
        classList.push(
          new ClassroomInfo(
            cla.classId,
            cla.description,
            cla.lessonTimes,
            cla.lessonPlace
          )
        );
      }
      return new ClassroomInfoPostRequest(classList);
    }
    console.error("no match body");
    return null;
  }
  private getInfoImageRequestParam(
    req: functions.https.Request
  ): ClassroomImagePostRequest | null {
    if (req) {
      return new ClassroomImagePostRequest(req);
    }
    console.error("no match body");
    return null;
  }
}
