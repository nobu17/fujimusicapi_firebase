import * as functions from "firebase-functions";
import HttpReqGetter from "./httpReqGetter";
import AuthService from "./authService";
//import LoginRequests from "./data/LoginRequestData";
import LoginRequest from "./data/LoginRequest";
import { AuthErrorType } from "./data/AuthResult";

export default class AuthFunction {
  async execFunc(req: functions.https.Request, res: functions.Response) {
    switch (req.method) {
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

  async handlePost(req: functions.https.Request, res: functions.Response) {
    // リクエストからパラメータ取得
    const reqgetter = new HttpReqGetter();
    const param = reqgetter.getParamData(req);
    if (param === null) {
      res.status(400).send({ error: "not support content-type or paramError" });
      return;
    }
    // リクエストデータの種類に応じて変更
    console.log("param", param);
    //console.log("param.constructor.name", param.constructor.name);
    if (param.constructor.name === "LoginRequest") {
      const serv = new AuthService();
      const result = await serv.getAuthResult(param as LoginRequest);
      console.log("result", result);
      if (result.errorType === AuthErrorType.none) {
        res
          .status(200)
          .send({
            userId: result.userId,
            role: result.role,
            token: result.token
          });
      } else if (
        result.errorType === AuthErrorType.authError ||
        result.errorType === AuthErrorType.noUser
      ) {
        console.error(result.errorMessage);
        res.status(404).send({ error: "auth is failed" });
      } else {
        console.error(result.errorMessage);
        res.status(503).send({ error: "surver error" });
      }
    } else {
      res.status(400).send({ error: "not support type or paramError" });
      return;
    }
  }
}
