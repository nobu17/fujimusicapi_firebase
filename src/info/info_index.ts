import * as functions from "firebase-functions";
import * as corsLib from "cors";

import Common from "../common/common";
import InfoFunction from "./infoFunction";

const cors = corsLib();

module.exports = functions
  .region("asia-northeast1")
  .https.onRequest(async (request, response) => {
    return cors(request, response, async () => {
      // check auth
      if (Common.IsAuthrizedRequest(request, functions.config().info.apikey)) {
        const func = new InfoFunction();
        await func.execFunc(request, response);
      } else {
        console.error(
          "auth error. api key is ",
          functions.config().info.apikey
        );
        response.status(400).send({ error: "not authorized" });
      }
    });
  });
