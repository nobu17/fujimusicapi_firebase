import * as functions from "firebase-functions";
import LoginRequest from "./data/LoginRequest";
import LoginTokenRequest from "./data/loginTokenRequest";
import IAuthReqData from "./data/IAuthReqData";

export default class HttpReqGetter {
  public getParamData(req: functions.https.Request): IAuthReqData | null {
    let res: IAuthReqData | null;
    console.log("content_type", req.get("content-type"));
    switch (req.get("content-type")) {
      case "application/json":
        //既にJSONからオブジェクトにパース済みなのでそのまま取ればよい
        //res = JSON.parse(req.body);
        console.log("body", req.body);
        res = this.getParam(req.body);
        break;
      default:
        res = null;
        break;
    }

    return res;
  }

  private getParam(body: any): IAuthReqData | null {
    if (
      typeof body === "object" &&
      body.method === "auth" &&
      typeof body.userId === "string" &&
      typeof body.password === "string"
    ) {
      return new LoginRequest(body.userId, body.password);
    }
    if (
      typeof body === "object" &&
      body.method === "authByToken" &&
      typeof body.userId === "string" &&
      typeof body.token === "string"
    ) {
      return new LoginTokenRequest(body.userId, body.token);
    }    
    console.error("no match body");
    return null;
  }
}
