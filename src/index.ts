import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as corsLib from "cors";

import AuthFunction from "./auth/auth_index";
import ClassRoomFunction from "./classroom/classroom_index";
import InfoFunction from "./info/info_index";
import Common from "./common/common";

admin.initializeApp();
const cors = corsLib();
// 認証関数
export const authFunction = functions.https.onRequest(
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

// お知らせ
export const infoFunction = functions.https.onRequest(
  async (request, response) => {
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
  }
);

// 教室情報関数
export const classroomFunction = functions.https.onRequest(
  async (request, response) => {
    return cors(request, response, async () => {
      // check auth
      if (
        Common.IsAuthrizedRequest(request, functions.config().classroom.apikey)
      ) {
        const func = new ClassRoomFunction();
        await func.execFunc(request, response);
      } else {
        console.error(
          "auth error. api key is ",
          functions.config().classroom.apikey
        );
        response.status(400).send({ error: "not authorized" });
      }
    });
  }
);
