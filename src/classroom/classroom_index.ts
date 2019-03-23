import * as functions from "firebase-functions";
import HttpReqGetter from "./heetpReqGetter";
import ClassroomService from "./classroomService";
import ClassroomInfoRequest from "./data/classroomInfoRequest";
import { ClassroomErrorType } from "./data/classroomInfoResult";

export default class ClassRoomFunction {
  async execFunc(req: functions.https.Request, res: functions.Response) {
    switch (req.method) {
      case "GET":
        try {
          await this.handleGet(req, res);
        } catch (err) {
          console.error("hanble get error", err);
          res.status(503).send({ error: "unexpected error" });
        }
        break;
      case "POST":
        try {
          await this.handlePost(req, res);
        } catch (err) {
          console.error("hanble post error", err);
          res.status(503).send({ error: "unexpected error" });
        }
        break;
      default:
        res.status(500).send({ error: "not support method" });
        break;
    }
  }
  async handleGet(req: functions.https.Request, res: functions.Response) {
    console.info("query", req.query);
    const reqGetter = new HttpReqGetter();
    const inputParam = reqGetter.getClassroomInfoRequest(req);
    if (!inputParam) {
      res.status(400).send({ error: "paramError" });
    }
    const serv = new ClassroomService();
    const result = await serv.getClassRoomInfo(
      inputParam as ClassroomInfoRequest
    );
    console.log("service result:", result);
    switch (result.errorType) {
      case ClassroomErrorType.none:
      case ClassroomErrorType.partialError:
        res.status(200).send({
          classroomList: result.classroomList,
          failClassIdList: result.failClassIdList
        });
        break;
      case ClassroomErrorType.paramError:
        res.status(400).send({
          error: "param error"
        });
        break;
      case ClassroomErrorType.noClasses:
        res.status(500).send({
          error: "no classes"
        });
        break;
      default:
        res.status(500).send({
          error: "not support"
        });
        break;
    }
  }
  async handlePost(req: functions.https.Request, res: functions.Response) {
    res.status(200).send({ error: "aaa error" });
  }
}
