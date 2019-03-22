import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import AuthFunction from "./auth/auth_index"

admin.initializeApp();
// 認証関数
export const authFunction = functions.https.onRequest(
  async (request, response) => {
    // check auth
    const request_key = request.get("authorization");
    if (request_key && request_key === functions.config().auth.apikey) {
      const func = new AuthFunction();
      await func.execFunc(request, response);
    } else {
      console.error("auth error. reqkey is:", request_key);
      response.status(400).send({ error: "not authorized" });
    }
  }
);