import * as functions from "firebase-functions";
import * as corsLib from "cors";

import AlbumFunction from "./albumFunction"
import Common from "../common/common";

const cors = corsLib();

// 教室情報関数
module.exports = functions.https.onRequest(
  async (request, response) => {
    return cors(request, response, async () => {
      // check auth
      if (
        Common.IsAuthrizedRequest(request, functions.config().album.apikey)
      ) {
        const func = new AlbumFunction();
        await func.execFunc(request, response);
      } else {
        console.error(
          "auth error. api key is ",
          functions.config().album.apikey
        );
        response.status(400).send({ error: "not authorized" });
      }
    });
  }
);
