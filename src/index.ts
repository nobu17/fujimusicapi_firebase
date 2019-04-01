import * as admin from "firebase-admin";

admin.initializeApp();

// 認証関数
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === "authFunction") {
  exports["authFunction"] = require("./auth/auth_index");
}
// お知らせ関数
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === "infoFunction") {
  exports["infoFunction"] = require("./info/info_index");
}
// 教室関数
if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === "classroomFunction") {
  exports["classroomFunction"] = require("./classroom/classroom_index");
}


