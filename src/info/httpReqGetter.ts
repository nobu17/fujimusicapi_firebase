import * as functions from "firebase-functions";
import InfoGetRequest from "./data/infoGetRequest";
import { InfoPostRequest } from "./data/infoPostRequest";

export default class HttpReqGetter {
  public getInfoGetRequest(
    req: functions.https.Request
  ): InfoGetRequest | null {
    let res: InfoGetRequest | null;

    if (!req.query || !req.query.mode || typeof req.query.mode !== "string") {
      res = null;
      return res;
    }
    // maxCountはオプション扱い(デフォルト10)
    let maxInfoCount = 10;
    if (req.query.maxInfoCount && !isNaN(parseInt(req.query.maxInfoCount))) {
      maxInfoCount = parseInt(req.query.maxInfoCount);
    } else {
      console.log(
        "max count is not defined.apply default value:",
        maxInfoCount
      );
    }
    let monthCount = 0;
    if (req.query.monthCount && !isNaN(parseInt(req.query.monthCount))) {
      monthCount = parseInt(req.query.monthCount);
    } else {
      console.log("monthCount is not defined:", monthCount);
    }

    res = new InfoGetRequest(
      req.query.mode,
      req.query.start,
      monthCount,
      maxInfoCount
    );
    return res;
  }

  public getInfoPostRequest(
    req: functions.https.Request
  ): InfoPostRequest | null {
      let res :InfoPostRequest | null;
    switch (req.get("content-type")) {
      case "application/json":
        //既にJSONからオブジェクトにパース済みなのでそのまま取ればよい
        //res = JSON.parse(req.body);
        console.log("body", req.body);
        res = this.getInfoPostRequestParam(req.body);
        break;
      default:
        res = null;
        break;
    }
    return res;
  }
  private getInfoPostRequestParam(body: any): InfoPostRequest | null {
    if (
      typeof body === "object" &&
      typeof body.postType === "string" &&
      typeof body.postInfo === "object"
    ) {
      return new InfoPostRequest(body.postType, body.postInfo);
    }
    console.error("no match body");
    return null;
  }
}
