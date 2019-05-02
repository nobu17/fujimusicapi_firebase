import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as Busboy from "busboy";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";

import Common from "../common/common";
import { AlbumPostRequest, AlbumDeleteRequest } from "./data/albumPostRequest";
import { Bucket } from "@google-cloud/storage";
import { CollectionReference } from "@google-cloud/firestore";

class FileInput {
  constructor(
    public filedName: string,
    public fileName: string,
    public mimetype: string,
    public tempUploadPath: string
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
export class AlbumRepositoryDeleteResult {
  public removeResults: FileResult;
  constructor() {
    this.removeResults = new FileResult();
  }
}

class AlbumRepositoryBase {
  public albumId: string;
  protected bucket: Bucket;
  constructor(public bucketName: string, public rootDir: string) {
    this.albumId = "";
    this.bucket = admin.storage().bucket(bucketName);
  }
  // アルバムのディレクトリを取得
  protected getDir(): string {
    return this.rootDir + this.albumId + "/";
  }
  protected getAlbumInfoDb(): CollectionReference {
    return admin.firestore().collection("albumInfo");
  }
}

class AlbumRepositoryDeleteInfo extends AlbumRepositoryBase {
  public result: FileResult;
  constructor(public bucketName: string, public rootDir: string) {
    super(bucketName, rootDir);
    this.result = new FileResult();
  }
  public async deleteAlbum(albumId: string) {
    this.albumId = albumId;
    try {
      const opt = { prefix: this.getDir() };
      await this.bucket.deleteFiles(opt);
      await this.getAlbumInfoDb()
        .doc(this.albumId)
        .delete();
      this.result.successList.push(this.albumId);
    } catch (err) {
      console.error("delete error:" + this.albumId, err);
      this.result.failList.push(this.albumId);
    }
  }
}

class AlbumRepositoryPostInfo extends AlbumRepositoryBase {
  public removeImages: Array<string>;
  public moveImages: Map<string, string>;
  public uploadImages: Array<FileInput>;

  public albumTitle: string;
  public albumEventDate: string;
  public albumDescritpion: string;

  public results: AlbumRepositoryPostResult;

  private uploadCount: number;
  private tempDir: string;
  constructor(bucketName: string, rootDir: string) {
    super(bucketName, rootDir);

    this.albumTitle = "";
    this.albumDescritpion = "";
    this.albumEventDate = "";
    this.removeImages = [];
    this.moveImages = new Map<string, string>();
    this.uploadImages = [];

    this.tempDir = os.tmpdir();
    this.uploadCount = 0;
    this.results = new AlbumRepositoryPostResult();
  }
  // 入力チェック
  public validate(): string {
    if (!this.albumTitle || this.albumTitle === "") {
      return "not eixsts albumTitle";
    }
    if (!this.albumDescritpion || this.albumDescritpion === "") {
      return "not eixsts albumDescritpion";
    }
    if (!this.albumEventDate || this.albumEventDate === "") {
      return "not eixsts albumEventDate";
    }
    if (!Common.isDate(this.albumEventDate, "-")) {
      return "invalid albumEventDate:" + this.albumEventDate;
    }
    return "";
  }
  // upsert album info for document db
  public async upsertAlbumDocument() {
    console.log("upsert start");
    //albumIdがあれば更新なければ新規
    if (this.albumId) {
      console.log("update");
      const docref = this.getAlbumInfoDb().doc(this.albumId);
      const data = await docref.get();
      console.log("docref", docref);
      // update
      if (data.exists) {
        await docref.update({
          title: this.albumTitle,
          description: this.albumDescritpion,
          eventDate: new Date(this.albumEventDate)
        });
        return;
      }
    }
    console.log("add start:", {
      title: this.albumTitle,
      description: this.albumDescritpion,
      eventDate: this.albumEventDate
    });
    // 無ければ新規に追加
    const added = await this.getAlbumInfoDb().add({
      title: this.albumTitle,
      description: this.albumDescritpion,
      eventDate: new Date(this.albumEventDate)
    });
    // get  from added
    this.albumId = added.id;
    console.log("add end:", added);
    console.log("new albumId:", this.albumId);
  }
  private async getImageList(): Promise<Array<string>> {
    const options = { prefix: this.getDir() };
    let [fileList] = await this.bucket.getFiles(options);
    // 画像ファイルだけ名前順に昇順ソート(サムネイルは除外)
    const imageList = fileList
      .filter(x => x.name.toLowerCase().endsWith(".jpg") && x.name.toLocaleLowerCase() != "thumbnail.jpg")
      .sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      })
      .map(x => x.name);

    for (let i = 0; i < imageList.length; i++) {
      imageList[i] = `https://firebasestorage.googleapis.com/v0/b/${
        this.bucketName
      }/o/${encodeURIComponent(imageList[i])}?alt=media`;
    }
    return imageList;
  }
  // make datesotre for albumInfo ImageList
  public async updateAlbumImageListAndThumbnail() {
    const imageList = await this.getImageList();
    console.log("imageList:", imageList);
    const docref = this.getAlbumInfoDb().doc(this.albumId);
    const data = await docref.get();
    if (data.exists) {
      await docref.update({
        imageList: imageList,
        thumbnail: `https://firebasestorage.googleapis.com/v0/b/${
        this.bucketName
      }/o/${encodeURIComponent("thumbnail.jpg")}?alt=media`
      });
    } else {
      throw new Error("no exists data. albumId:" + this.albumId);
    }
  }
  public uploadImage(
    file: NodeJS.ReadableStream,
    fieldName: string,
    fileName: string,
    mimetype: string
  ): void {
    const filePath = path.join(this.tempDir, fieldName + ".jpg");
    file.pipe(fs.createWriteStream(filePath));
    this.uploadCount++;
    this.uploadImages.push(
      new FileInput(fieldName, fileName, mimetype, filePath)
    );
  }
  // 画像の削除
  public async removeImagesAsync(): Promise<void> {
    console.log("remove image start");
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
    console.log("move image start");
    for (const temp of this.moveImages.entries()) {
      try {
        console.log("from:" + temp[0] + " to:" + temp[1]);
        await this.bucket
          .file(this.getDir() + temp[0])
          .move(this.getDir() + temp[1]);
        this.results.moveResults.successList.push(temp[0]);
      } catch (err) {
        console.error("move error:" + temp[0] + "," + temp[1], err);
        this.results.moveResults.failList.push(temp[0]);
      }
    }
  }
  public async uploadImagesAsync() {
    console.log("upload image start");
    let finishCount = 0;
    for (const f of this.uploadImages) {
      // バケットへファイルのアップロード
      const dest = this.getDir() + f.filedName + ".jpg";
      try {
        console.log("upload file:", dest);
        await this.bucket.upload(f.tempUploadPath, {
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
    }
    //アップロードが終わるまで待機
    // wait until all file uplod is finished
    while (finishCount !== this.uploadCount) {
      console.log("sleep:" + finishCount + "," + this.uploadCount);
      await Common.sleep(400);
    }
  }
}

export class AlbumRepository {
  private buketName: string;
  private readonly rootDir: string = "albums/";
  constructor() {
    this.buketName = functions.config().album.bucket.name;
  }

  public async deleteAlbum(
    req: AlbumDeleteRequest
  ): Promise<AlbumRepositoryDeleteResult> {
    const delInfo = new AlbumRepositoryDeleteInfo(this.buketName, this.rootDir);
    for (const albumId of req.albumIdList) {
      await delInfo.deleteAlbum(albumId);
    }
    const res = new AlbumRepositoryDeleteResult();
    res.removeResults = delInfo.result;
    return res;
  }

  public postAlbum(
    input: AlbumPostRequest,
    callback: (result: AlbumRepositoryPostResult) => void
  ) {
    const postInfo = new AlbumRepositoryPostInfo(this.buketName, this.rootDir);
    const allowMimeTypes = ["image/png", "image/jpg", "image/jpeg"];
    const busboy = new Busboy({ headers: input.req.headers });

    busboy.on("field", (fieldname, val, fieldnameTruncated, valTruncated) => {
      if (fieldname === "albumTitle") {
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
      } else if (fieldname === "eventDate") {
        postInfo.albumEventDate = val;
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
      postInfo.uploadImage(file, fieldname, filename, mimetype);
    });

    // This callback will be invoked after all uploaded files are saved.
    busboy.on("finish", async () => {
      console.log("post info:", postInfo);
      const validateRes = postInfo.validate();
      if (validateRes !== "") {
        //バリデーションエラー
        console.error("valition error", validateRes);
        postInfo.results.errorMessage = validateRes;
        callback(postInfo.results);
        return;
      }
      // documentdbの更新
      await postInfo.upsertAlbumDocument();
      console.log("upsert end");
      // 画像のアップロード、編集
      await postInfo.uploadImagesAsync();
      await postInfo.removeImagesAsync();
      await postInfo.moveImagesAsync();
      // アップロード後にimageListを更新
      console.log("update imageList");
      await postInfo.updateAlbumImageListAndThumbnail();
      console.log("result", postInfo.results);
      callback(postInfo.results);
    });

    // The raw bytes of the upload will be in req.rawBody. Send it to
    // busboy, and get a callback when it's finished.
    busboy.end(input.req.rawBody);
  }
}
