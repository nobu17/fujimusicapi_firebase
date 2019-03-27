import * as functions from "firebase-functions";
import HttpReqGetter from "./httpReqGetter";
import InfoService from "./infoService";
import { InfoErrorType } from "./data/infoGetResult";
import { InfoPostErrorType } from "./data/infoPostResult";

export default class InfoFunction {
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
    const reqGetter = new HttpReqGetter();
    const inputParam = reqGetter.getInfoGetRequest(req);
    if (!inputParam) {
      res.status(400).send({ error: "paramError" });
      return;
    }
    const serv = new InfoService();
    const result = await serv.getInfoList(inputParam);
    console.log("service result:", result);
    switch (result.errorType) {
      case InfoErrorType.none:
        res.status(200).send({
          infoList: result.infoList
        });
        break;
      case InfoErrorType.paramError:
        res.status(400).send({
          error: "param error"
        });
        break;
      case InfoErrorType.noData:
        res.status(404).send({
          error: "no data"
        });
        break;
      case InfoErrorType.exception:
        res.status(500).send({
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
  async handlePost(req: functions.https.Request, res: functions.Response) {
    const reqGetter = new HttpReqGetter();
    const inputParam = reqGetter.getInfoPostRequest(req);
    if (!inputParam) {
      res.status(400).send({ error: "paramError" });
      return;
    }
    const serv = new InfoService();
    const result = await serv.postInfo(inputParam);
    console.log("service result:", result);
    switch (result.errorType) {
      case InfoPostErrorType.none:
        res.status(200).send({
          message : "post is success"
        });
        break;
      case InfoPostErrorType.paramError:
        res.status(400).send({
          error: "param error"
        });
        break;
      case InfoPostErrorType.exception:
        res.status(500).send({
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
