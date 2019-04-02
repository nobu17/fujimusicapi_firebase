import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as Busboy from "busboy";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { ClassroomInfo } from "./data/classroomInfoResult";
import ClassroomInfoRequest from "./data/classroomInfoRequest";
import {
  ClassroomInfoPostRequest,
  ClassroomImagePostRequest
} from "./data/classroomPostRequest";

export default class ClassroomRepository {
  private readonly classroomFileName: string = "classInfo.json";
  private readonly rootDir: string = "classrooms/";
  private readonly classroomImageDirName: string = "images/";
  private buketName: string;
  constructor() {
    this.buketName = functions.config().classroom.bucket.name;
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
        if (!isExists || !isExists[0]) {
          console.error("not eixst file :", fileName);
          failClassIdList.push(classId);
        } else {
          const data = await file.download();
          console.log("download", data.toString());
          const room = this.getClassroomInfo(classId, data.toString());
          if (room) {
            // 画像を取得
            const imageList = await this.getImageList(classId);
            if (imageList === null) {
              failClassIdList.push(classId);
            } else {
              room.imageList = imageList;
              sucessClassIdList.push(classId);
              classRoomInfoList.push(room);
            }
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

  private async getImageList(classId: string): Promise<Array<string> | null> {
    const imageList = new Array<string>();
    const bucket = admin.storage().bucket(this.buketName);
    const dirNames = this.rootDir + classId + "/" + this.classroomImageDirName;
    const options = { prefix: dirNames };

    try {
      // ファイル一覧を取得
      let [fileList] = await bucket.getFiles(options);
      if (fileList && fileList.length > 0) {
        for (const f of fileList) {
          // 署名付きURLを取得
          const [url] = await f.getSignedUrl({
            action: "read",
            expires: "03-09-2491"
          });
          console.log("url", url);
          imageList.push(url);
        }
      }
      return imageList;
    } catch (err) {
      console.error("url get error", err);
      return null;
    }
  }

  // JSONデータからクラス情報を取得します
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
        if (obj.description && typeof obj.description === "string") {
          desc = obj.description;
        } else {
          console.warn("description is not defined:");
        }
        if (obj.lessonTimes && typeof obj.lessonTimes === "string") {
          lessonTimes = obj.lessonTimes;
        } else {
          console.warn("lessonTimes is not defined:");
        }
        if (obj.lessonPlace && typeof obj.lessonPlace === "string") {
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
  // 記事の投稿
  // Array<string> : 成功したクラスID
  // [string, string]  : 失敗したID, message
  public async postClassInfo(
    req: ClassroomInfoPostRequest
  ): Promise<[Array<string>, Map<string, string>] | null> {
    const successList = new Array<string>();
    const failList = new Map<string, string>();
    // クラス別に保存
    for (const cla of req.classList) {
      const str = JSON.stringify(cla);
      const fileName =
        this.rootDir + cla.classId + "/" + this.classroomFileName;
      if (!(await this.uploadFile(str, fileName))) {
        failList.set(cla.classId, "file upload is fail");
      } else {
        successList.push(cla.classId);
      }
    }
    return [successList, failList];
  }

  private async uploadFile(
    jsonString: string,
    fileName: string
  ): Promise<boolean> {
    const bucket = admin.storage().bucket(this.buketName);
    try {
      await bucket.file(fileName).save(jsonString);
      return true;
    } catch (err) {
      console.error("upload is fail", err);
      return false;
    }
  }

  async sleep(t: number) {
    return await new Promise(r => {
      setTimeout(() => {
        r();
      }, t);
    });
  }

  public postClassImage(
    input: ClassroomImagePostRequest,
    callback: (successList: Array<string>, failList: Array<string>) => void
  ) {
    const allowMimeTypes = ["image/png", "image/jpg"];
    const bucket = admin.storage().bucket();
    const busboy = new Busboy({ headers: input.req.headers });
    const successList: Array<string> = new Array<string>();
    const failList: Array<string> = new Array<string>();

    const tmpdir = os.tmpdir();
    let fileCount = 0;
    let currentCount = 0;
    // This callback will be invoked for each file uploaded.
    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      if (!allowMimeTypes.find(x => x === mimetype.toLocaleLowerCase())) {
        console.error("disallow mimetype: " + mimetype);
        failList.push(filename);
        file.resume();
        return;
      }
      // fieldnameからClassIDとファイル名に分割
      const classId = fieldname.split("_")[0];
      const classFName = fieldname.split("_")[1];
      const extension = filename.split(".")[1];
      // Note that os.tmpdir() is an in-memory file system, so should
      // only be used for files small enough to fit in memory.

      const filepath = path.join(tmpdir, classFName + "." + extension);
      file.pipe(fs.createWriteStream(filepath));
      fileCount++;
      // ファイルのアップロード
      file.on("end", () => {
        const dest =
          this.rootDir +
          classId +
          "/" +
          this.classroomImageDirName +
          "/" +
          classFName +
          "." +
          extension;
        console.log(
          "upload file: " +
            filepath +
            " metadata: " +
            mimetype +
            " dest:" +
            dest
        );
        bucket
          .upload(filepath, {
            destination: dest,
            metadata: { contentType: mimetype }
          })
          .then(() => {
            console.log("file upload success: " + dest);
            return new Promise((resolve, reject) => {
              fs.unlink(filepath, err => {
                if (err) {
                  failList.push(fieldname + ":" + dest);
                  currentCount++;
                  reject(err);
                } else {
                  successList.push(fieldname + ":" + dest);
                  currentCount++;
                  resolve();
                }
              });
            });
          })
          .catch(err => {
            console.error("unexpected error while file uploaded", err);
            failList.push(fieldname + ":" + dest);
          });
      });
    });

    // This callback will be invoked after all uploaded files are saved.
    busboy.on("finish", async () => {
      // wait until all file uplod is finished
      while (currentCount !== fileCount) {
        console.log("sleep:" + currentCount + "," + fileCount);
        await this.sleep(400);
      }
      console.log("successList", successList);
      console.log("failList", failList);
      callback(successList, failList);
    });

    // The raw bytes of the upload will be in req.rawBody. Send it to
    // busboy, and get a callback when it's finished.
    busboy.end(input.req.rawBody);
  }
}
