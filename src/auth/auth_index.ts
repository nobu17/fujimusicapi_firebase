import * as functions from "firebase-functions";
import * as corsLib from "cors";

import Common from "../common/common";
import AuthFunction from "./authFunction";

const cors = corsLib();
// 認証関数
module.exports = functions.https.onRequest(
  async (request, response) => {
    return cors(request, response, async () => {
      // check auth
      if (Common.IsAuthrizedRequest(request, functions.config().auth.apikey)) {
        const func = new AuthFunction();
        await func.execFunc(request, response);
      } else {
        console.error(
          "auth error. api key is ",
          functions.config().auth.apikey
        );
        response.status(400).send({ error: "not authorized" });
      }
    });
  }
);
