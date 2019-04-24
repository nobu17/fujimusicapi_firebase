import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as Busboy from "busboy";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";

import Common from "../common/common";
import { AlbumPostRequest } from "./data/albumPostRequest";
import { Bucket } from "@google-cloud/storage";

class FileInput {
  constructor(
    public file: NodeJS.ReadableStream,
    public filedName: string,
    public fileName: string,
    public mimetype: string
  ) {}
}

export class FileResult {
  public successList: Array<string>;
  public failList: Array<string>;
  constructor() {
    this.failList = [];
    this.successList = [];
  }
}
export class AlbumRepositoryPostResult {
  public uploadResults: FileResult;
  public moveResults: FileResult;
  public removeResults: FileResult;
  public errorMessage: string;
  constructor() {
    this.uploadResults = new FileResult();
    this.moveResults = new FileResult();
    this.removeResults = new FileResult();
    this.errorMessage = "";
  }
}

export class AlbumRepositoryPostInfo {
  public removeImages: Array<string>;
  public moveImages: Map<string, string>;
  public uploadImages: Array<FileInput>;
  public albumId: string;
  public albumTitle: string;
  public albumDescritpion: string;

  public results: AlbumRepositoryPostResult;

  private bucket: Bucket;
  constructor(public bucketName: string, public rootDir: string) {
    this.albumId = "";
    this.albumTitle = "";
    this.albumDescritpion = "";
    this.removeImages = [];
    this.moveImages = new Map<string, string>();
    this.uploadImages = [];

    this.bucket = admin.storage().bucket(bucketName);
    this.results = new AlbumRepositoryPostResult();
  }
  // 入力チェック
  public validate(): string {
    if (!this.albumId || this.albumId === "") {
      return "iregular albumId";
    }
    return "";
  }
  // 画像の削除
  public async removeImagesAsync(): Promise<void> {
    for (const image of this.removeImages) {
      try {
        await this.bucket.file(this.getDir() + image).delete();
        this.results.removeResults.successList.push(image);
      } catch (err) {
        console.error("del error:" + image, err);
        this.results.removeResults.failList.push(image);
      }
    }
  }
  // 画像の移動
  public async moveImagesAsync(): Promise<void> {
    for (const temp of this.moveImages.entries()) {
      try {
        await this.bucket
          .file(this.getDir() + temp[0])
          .move(this.getDir() + temp[1]);
        this.results.uploadResults.successList.push(temp[0]);
      } catch (err) {
        console.error("move error:" + temp[0] + "," + temp[1], err);
        this.results.uploadResults.failList.push(temp[0]);
      }
    }
  }
  public async uploadImagesAsync() {
    let fileCount = 0;
    let finishCount = 0;
    const tmpdir = os.tmpdir();
    for (const f of this.uploadImages) {
      const filePath = path.join(tmpdir, f.filedName + ".jpg");
      f.file.pipe(fs.createWriteStream(filePath));
      fileCount++;
      // バケットへファイルのアップロード
      f.file.on("end", async () => {
        const dest = this.getDir() + f.filedName + ".jpg";
        try {
          await this.bucket.upload(filePath, {
            destination: dest,
            metadata: { contentType: f.mimetype }
          });
          this.results.uploadResults.successList.push(f.fileName);
        } catch (err) {
          console.error("upload error:" + dest, err);
          this.results.uploadResults.failList.push(f.fileName);
        } finally {
          finishCount++;
        }
      });
    }
    //アップロードが終わるまで待機
    // wait until all file uplod is finished
    while (finishCount !== fileCount) {
      console.log("sleep:" + finishCount + "," + fileCount);
      await Common.sleep(400);
    }
  }
  // アルバムのディレクトリを取得
  private getDir(): string {
    return this.rootDir + this.albumId + "/";
  }
}

export class AlbumRepository {
  private buketName: string;
  private readonly rootDir: string = "albums/";
  constructor() {
    this.buketName = functions.config().album.bucket.name;
  }

  public postAlbumImages(
    input: AlbumPostRequest,
    callback: (result: AlbumRepositoryPostResult) => void
  ) {
    const postInfo = new AlbumRepositoryPostInfo(this.buketName, this.rootDir);
    const allowMimeTypes = ["image/png", "image/jpg", "image/jpeg"];
    const busboy = new Busboy({ headers: input.req.headers });

    busboy.on("field", (fieldname, val, fieldnameTruncated, valTruncated) => {
      if (fieldname === "title") {
        postInfo.albumTitle = val;
      } else if (fieldname === "albumDescritpion") {
        postInfo.albumDescritpion = val;
      } else if (fieldname === "removeImages") {
        // カンマ区切り
        postInfo.removeImages = val.split(",");
      } else if (fieldname === "moveImages") {
        // カンマ区切りで:でKey,value
        for (const kv of val.split(",") as string[]) {
          const temp = kv.split(":");
          postInfo.moveImages.set(temp[0], temp[1]);
        }
      } else if (fieldname === "albumId") {
        postInfo.albumId = val;
      }
    });

    // This callback will be invoked for each file uploaded.
    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      if (!allowMimeTypes.find(x => x === mimetype.toLocaleLowerCase())) {
        console.error("disallow mimetype: " + mimetype);
        postInfo.results.uploadResults.failList.push(filename);
        file.resume();
        return;
      }
      postInfo.uploadImages.push(
        new FileInput(file, fieldname, filename, mimetype)
      );
    });

    // This callback will be invoked after all uploaded files are saved.
    busboy.on("finish", async () => {
      // 削除と移動
      const validateRes = postInfo.validate();
      if (validateRes !== "") {
        //バリデーションエラー
        console.error("valition error", validateRes);
        postInfo.results.errorMessage = validateRes;
        callback(postInfo.results);
        return;
      }
      // 画像のアップロード、編集
      await postInfo.uploadImagesAsync();
      await postInfo.removeImagesAsync();
      await postInfo.moveImagesAsync();
      console.log("result", postInfo.results);
      callback(postInfo.results);
    });

    // The raw bytes of the upload will be in req.rawBody. Send it to
    // busboy, and get a callback when it's finished.
    busboy.end(input.req.rawBody);
  }
}
