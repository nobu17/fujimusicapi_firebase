import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { ClassroomInfo } from "./data/classroomInfoResult";
import ClassroomInfoRequest from "./data/classroomInfoRequest";

export default class ClassroomRepository {
  private readonly classroomFileName: string = "classInfo.json";
  private readonly rootDir: string = "classrooms/";
  private buketName: string;
  constructor() {
    this.buketName = functions.config().auth.bucket.name;
    console.log("bucketName:", this.buketName);
  }

  public async getClassroomInfoList(
    req: ClassroomInfoRequest
  ): Promise<[Array<ClassroomInfo>, Array<string>]> {
    const sucessClassIdList = new Array<string>();
    const failClassIdList = new Array<string>();
    const classRoomInfoList = new Array<ClassroomInfo>();

    const bucket = admin.storage().bucket(this.buketName);
    // クラス一覧を取得
    console.log("repository req:", req);
    const allClasses = req.getClassList();
    // 順番にファイル取得
    console.log("allClasses:", allClasses);
    for (const classId of allClasses) {
      //ファイル名は クラスID/ファイル名
      console.log("classId", classId);
      const fileName = this.rootDir + classId + "/" + this.classroomFileName;
      const file = bucket.file(fileName);
      try {
        console.log("filename:", fileName);
        const isExists = await file.exists();
        if (!isExists) {
          console.error("not eixst file :", fileName);
          failClassIdList.push(classId);
        } else {
          const data = await file.download();
          console.log("download", data.toString());
          const room = this.getClassroomInfo(classId, data.toString());
          if (room) {
            sucessClassIdList.push(classId);
            classRoomInfoList.push(room);
          } else {
            console.error("room error:");
            failClassIdList.push(classId);
          }
        }
      } catch (err) {
        console.error("download error:" + fileName, err);
        failClassIdList.push(classId);
      }
    }
    return [classRoomInfoList, failClassIdList];
  }

  private getClassroomInfo(
    classId: string,
    jsonData: string
  ): ClassroomInfo | null {
    try {
      const obj = JSON.parse(jsonData.toString());
      let desc = "";
      let lessonTimes = "";
      let lessonPlace = "";

      if (obj) {
        if (!obj.description && typeof obj.description === "string") {
          desc = obj.description;
        } else {
          console.warn("description is not defined:");
        }
        if (!obj.lessonTimes && typeof obj.lessonTimes === "string") {
          lessonTimes = obj.lessonTimes;
        } else {
          console.warn("lessonTimes is not defined:");
        }
        if (!obj.lessonPlace && typeof obj.lessonPlace === "string") {
          lessonPlace = obj.lessonPlace;
        } else {
          console.warn("lessonPlace is not defined:");
        }
        return new ClassroomInfo(classId, desc, lessonTimes, lessonPlace);
      } else {
        console.error("parse object is null:");
        return null;
      }
    } catch (err) {
      console.error("getClassroomInfo error:", err);
      return null;
    }
  }
}
