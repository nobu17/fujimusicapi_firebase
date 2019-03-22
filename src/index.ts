import * as functions from "firebase-functions";
//import express = require("express");
//import AuthService from "./authService";
import HttpReqGetter from "./httpReqGetter";
import AuthService from "./authService";
//import LoginRequests from "./data/LoginRequestData";
import LoginRequest from "./data/LoginRequest";
import { AuthErrorType } from "./data/AuthResult";
import * as admin from "firebase-admin";

admin.initializeApp();
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const authFunction = functions.https.onRequest(
  async (request, response) => {
    // check auth
    const request_key = request.get("authorization");
    if (request_key && request_key === functions.config().auth.apikey) {
      switch (request.method) {
        case "POST":
          try {
            await handlePost(request, response);
          } catch (err) {
            console.error("hanble post error", err);
            response.status(503).send({ error: "unexpected error" });
          }
          break;
        default:
          response.status(500).send({ error: "not support method" });
          break;
      }
    } else {
      console.error("auth error. reqkey is:", request_key);
      response.status(400).send({ error: "not authorized" });
    }
  }
);

async function handlePost(
  req: functions.https.Request,
  res: functions.Response
) {
  // リクエストからパラメータ取得
  const reqgetter = new HttpReqGetter();
  const param = reqgetter.getParamData(req);
  if (param == null) {
    res.status(400).send({ error: "not support content-type or paramError" });
    return;
  }
  // リクエストデータの種類に応じて変更
  console.log("param", param);
  //console.log("param.constructor.name", param.constructor.name);
  if (param.constructor.name === "LoginRequest") {
    const serv = new AuthService();
    let result = await serv.getAuthResult(param as LoginRequest);
    console.log("result", result);
    if (result.errorType === AuthErrorType.none) {
      res.status(200).send({ userId: result.userId, role: result.role });
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
