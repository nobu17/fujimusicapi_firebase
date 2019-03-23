import * as functions from "firebase-functions";
import HttpReqGetter from "./httpReqGetter";

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
    const inputParam = reqGetter.getClassroomInfoRequest(req);
    if (!inputParam) {
      res.status(400).send({ error: "paramError" });
      return;
    }
    res.status(200).send({ error: "aaa error" });
  }
  async handlePost(req: functions.https.Request, res: functions.Response) {
    res.status(200).send({ error: "aaa error" });
  }
}
