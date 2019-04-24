import * as functions from "firebase-functions";
import HttpReqGetter from "./httpReqGetter";
import AlbumService from "./albumService";
import { AlbumPostRequest } from "./data/albumPostRequest";
import { AlbumPostErrorType } from "./data/albumPostResult";

export default class AlbumFunction {
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
    const inputParam = reqGetter.getAlbumPostRequest(req);
    if (!inputParam) {
      res.status(400).send({ error: "paramError" });
      return;
    }
    if (inputParam.getMethodType() === "albumPost") {
      const serv = new AlbumService();
      const result = await serv.postTopPageImages(
        inputParam as AlbumPostRequest
      );
      console.log("service result:", result);
      switch (result.errorType) {
        case AlbumPostErrorType.none:
        case AlbumPostErrorType.partialError:
          res.status(200).send({
            result
          });
          break;
        case AlbumPostErrorType.paramError:
          res.status(400).send({
            error: "param error"
          });
          break;
        case AlbumPostErrorType.exception:
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
      res.status(400).send({ error: "paramError no support param type" });
      return;
    }
  }
}
