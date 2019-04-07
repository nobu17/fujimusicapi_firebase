import * as functions from "firebase-functions";
import HttpReqGetter from "./httpReqGetter";
import TopPageService from "./topPageService";
import { TopPageImagePostRequest } from "./data/topPageRequest";
import { TopPagePostErrorType } from "./data/topPageResult";

export default class TopPageFunction {
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
    res.status(400).send({ error: "not suppeorted" });
  }
  async handlePost(req: functions.https.Request, res: functions.Response) {
    const reqGetter = new HttpReqGetter();
    const inputParam = reqGetter.getClassroomInfoRequest(req);
    if (!inputParam) {
      res.status(400).send({ error: "paramError" });
      return;
    }
    if (inputParam.getMethodType() === "topImage") {
      const serv = new TopPageService();
      const result = await serv.postTopPageImages(
        inputParam as TopPageImagePostRequest
      );
      console.log("service result:", result);
      switch (result.errorType) {
        case TopPagePostErrorType.none:
        case TopPagePostErrorType.partialError:
          res.status(200).send({
            successFileList: result.successFileList,
            failFileList: result.failFileList
          });
          break;
        case TopPagePostErrorType.paramError:
          res.status(400).send({
            error: "param error"
          });
          break;
        case TopPagePostErrorType.exception:
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
    }
  }
}
