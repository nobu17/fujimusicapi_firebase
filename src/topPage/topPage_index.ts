import * as functions from "firebase-functions";
import * as corsLib from "cors";

import Common from "../common/common";
import TopPageFunction from "./topPageFunction";

const cors = corsLib();

// 教室情報関数
module.exports = functions
  .region("asia-northeast1")
  .https.onRequest(async (request, response) => {
    return cors(request, response, async () => {
      // check auth
      if (
        Common.IsAuthrizedRequest(request, functions.config().toppage.apikey)
      ) {
        const func = new TopPageFunction();
        await func.execFunc(request, response);
      } else {
        console.error(
          "auth error. api key is ",
          functions.config().classroom.apikey
        );
        response.status(400).send({ error: "not authorized" });
      }
    });
  });
