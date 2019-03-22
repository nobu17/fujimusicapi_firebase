import { UserList } from "./data/userInfo";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export class AuthDataRepository {
  private buketName: string;
  private fileName: string;

  constructor() {
    this.buketName = functions.config().auth.bucket.name;
    this.fileName = functions.config().auth.bucket.filename;
    console.log("bucketName:", this.buketName);
    console.log("fileName:", this.fileName);
  }

  async getUserList(): Promise<UserList | null> {
    const bucket = admin.storage().bucket(this.buketName);
    const file = bucket.file(this.fileName);
    try {
      const data = await file.download();
      //const text_dec = new TextDecoder("utf-8");
      console.log("download", data.toString());
      const obj = JSON.parse(data.toString());
      return new UserList(obj.userList);
    } catch (err) {
      console.error("getUserList error", err);
      return null;
    }
  }
}
