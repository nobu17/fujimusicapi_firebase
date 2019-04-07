import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as Busboy from "busboy";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";

import Common from "../common/common";
import { TopPageImagePostRequest } from "./data/topPageRequest";

export default class TopPageRepository {
  private buketName: string;
  private readonly rootDir: string = "topPage/";
  private readonly imageDirName: string = "images/";
  constructor() {
    this.buketName = functions.config().toppage.bucket.name;
  }

  public postTopImage(
    input: TopPageImagePostRequest,
    callback: (successList: Array<string>, failList: Array<string>) => void
  ) {
    const allowMimeTypes = [ "image/jpg", "image/jpeg"];
    const bucket = admin.storage().bucket(this.buketName);
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
      // fieldnameをファイル名として使用
      const imageNo = fieldname;
      let extension = "";;
      if (mimetype.endsWith("jpg") || mimetype.endsWith("jpeg")) {
        extension = "jpg";
      }
      // Note that os.tmpdir() is an in-memory file system, so should
      // only be used for files small enough to fit in memory.

      const filepath = path.join(tmpdir, imageNo + "." + extension);
      file.pipe(fs.createWriteStream(filepath));
      fileCount++;
      // ファイルのアップロード
      file.on("end", () => {
        const dest =
          this.rootDir + this.imageDirName + imageNo + "." + extension;
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
        await Common.sleep(400);
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
