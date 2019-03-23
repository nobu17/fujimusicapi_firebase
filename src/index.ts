import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import AuthFunction from "./auth/auth_index"
import ClassRoomFunction from "./classroom/classroom_index"
import Common from "./common/common"

admin.initializeApp();
// 認証関数
export const authFunction = functions.https.onRequest(
  async (request, response) => {
    // check auth
    if (Common.IsAuthrizedRequest(request, functions.config().auth.apikey)) {
      const func = new AuthFunction();
      await func.execFunc(request, response);
    } else {
      console.error("auth error. api key is ", functions.config().auth.apikey);
      response.status(400).send({ error: "not authorized" });
    }
  }
);

// 教室情報関数
export const classroomFunction = functions.https.onRequest(
  async (request, response) => {
    // check auth
    if (Common.IsAuthrizedRequest(request, functions.config().classroom.apikey)) {
      const func = new ClassRoomFunction();
      await func.execFunc(request, response);
    } else {
      console.error("auth error. api key is ", functions.config().classroom.apikey);
      response.status(400).send({ error: "not authorized" });
    }
  }
);
