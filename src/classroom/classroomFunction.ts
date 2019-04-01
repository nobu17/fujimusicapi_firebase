
import * as functions from "firebase-functions";
import HttpReqGetter from "./httpReqGetter";
import ClassroomService from "./classroomService";
import { ClassroomErrorType } from "./data/classroomInfoResult";
import {
  ClassroomInfoPostRequest,
  ClassroomImagePostRequest
} from "./data/classroomPostRequest";
import { ClassroomPostErrorType } from "./data/classroomPostResult";

export default class ClassRoomFunction {
  async execFunc(req: functions.https.Request, res: functions.Response) {
    switch (req.method) {
      case "GET":
        try {
          await this.handleGet(req, res);
        } catch (err) {
          console.error("handle get error", err);
          res.status(503).send({ error: "unexpected error" });
        }
        break;
      case "POST":
        try {
          await this.handlePost(req, res);
        } catch (err) {
          console.error("handle post error", err);
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
      return;
    }
    const serv = new ClassroomService();
    const result = await serv.getClassRoomInfo(inputParam);
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
    const reqGetter = new HttpReqGetter();
    const inputParam = reqGetter.getClassroomPostRequest(req);
    if (!inputParam) {
      res.status(400).send({ error: "paramError" });
      return;
    }
    if (inputParam.getMethodType() === "classInfo") {
      const serv = new ClassroomService();
      const result = await serv.postClassInfo(
        inputParam as ClassroomInfoPostRequest
      );
      console.log("service result:", result);
      switch (result.errorType) {
        case ClassroomPostErrorType.none:
        case ClassroomPostErrorType.partialError:
          res.status(200).send({
            successClassIdList: result.successClassIdList,
            failClassIdList: result.failClassIdList
          });
          break;
        case ClassroomPostErrorType.paramError:
          res.status(400).send({
            error: "param error"
          });
          break;
        case ClassroomPostErrorType.exception:
          res.status(400).send({
            error: result.errorMessage
          });
          break;
        default:
          res.status(500).send({
            error: "not support"
          });
          break;
      }
    } else if (inputParam.getMethodType() === "classImage") {
      console.log("classImage");
      const serv = new ClassroomService();
      const result = await serv.postClassImage(
        inputParam as ClassroomImagePostRequest
      );
      console.log("service result:", result);
      switch (result.errorType) {
        case ClassroomPostErrorType.none:
        case ClassroomPostErrorType.partialError:
          res.status(200).send({
            successClassIdList: result.successFileList,
            failClassIdList: result.failFileList
          });
          break;
        case ClassroomPostErrorType.paramError:
          res.status(400).send({
            error: "param error"
          });
          break;
        case ClassroomPostErrorType.exception:
          res.status(400).send({
            error: result.errorMessage
          });
          break;
        default:
          res.status(500).send({
            error: "not support"
          });
          break;
      }
    } else {
      res.status(400).send({ error: "unexpected error" });
    }
  }
}
