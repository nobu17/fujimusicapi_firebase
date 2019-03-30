import * as functions from "firebase-functions";
import { Info } from "./data/infoGetResult";
import InfoGetRequest from "./data/infoGetRequest";
import { InfoPostRequest } from "./data/infoPostRequest";
import * as admin from "firebase-admin";
import * as uuid from "uuid";

export default class InfoRepository {
  private readonly rootDir: string = "info/";
  private buketName: string;

  constructor() {
    this.buketName = functions.config().info.bucket.name;
    console.log("bucketName:", this.buketName);
  }
  // 記事の取得
  public async getInfoList(
    req: InfoGetRequest
  ): Promise<[Array<Info>, string]> {
    if (req.mode === "date") {
      return await this.getInfoListByDate(req);
    } else {
      return await this.getInfoListByCount(req);
    }
  }
  // 記事の投稿及び編集、削除
  public async postInfo(req: InfoPostRequest): Promise<string> {
    if (req.isMakeMode()) {
      return await this.makeNewInfo(req);
    } else if (req.isEditMode()) {
      //編集の場合は削除してから新規作成
      const delRes = await this.deleteInfo(req);
      if (delRes === "") {
        //idは新しい日付に基づいて再度付与される
        return await this.makeNewInfo(req);
      } else {
        return delRes;
      }
    } else if (req.isDeleteMode()) {
      return await this.deleteInfo(req);
    }
    console.error("mode error", req);
    return "mode error";
  }

  // #region postInfo

  // #region makepost

  // 新規投稿
  private async makeNewInfo(req: InfoPostRequest): Promise<string> {
    //ファイル名取得
    const fileName = this.getFileNameByPostDate(req.postInfo.postDate);
    // ファイル読み込み
    let infoList = await this.readInfoList(fileName);
    if (infoList === null) {
      return "read file is fail:" + fileName;
    }
    const editData = infoList;
    const addData = req.postInfo;
    // 更新日からIDを付与
    addData.id = this.getIdByPostDate(addData.postDate);
    editData.push(addData);
    // JSON文字列を保存
    if (this.uploadFile(JSON.stringify(editData), fileName)) {
      console.log("upload is successeded", fileName);
      return "";
    } else {
      return "upload file is fail:" + fileName;
    }
  }
  // バケットからデータを読み込む
  private async readInfoList(fileName: string): Promise<Array<Info> | null> {
    let infoList = new Array<Info>();
    const bucket = admin.storage().bucket(this.buketName);

    const isFileExists = await bucket.file(fileName).exists();
    // ファイルがある場合のみ読み込む
    if (isFileExists && isFileExists[0]) {
      console.log("file Exists. start reading:", fileName);
      try {
        const data = await bucket.file(fileName).download();
        const ninfoList = this.getInfoListByJson(data.toString()) as Array<
          Info
        >;
        if (ninfoList) {
          infoList = ninfoList;
        }
      } catch (err) {
        console.error("file download error:", err);
        return null;
      }
    }
    return infoList;
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

  private async deleteFile(fileName: string) {
    const bucket = admin.storage().bucket(this.buketName);
    try {
      await bucket.file(fileName).delete();
      return true;
    } catch (err) {
      console.error("upload is fail", err);
      return false;
    }
  }

  //日付からファイル名を取得
  private getFileNameByPostDate(postDate: string) {
    const yearAndMonth = postDate.substr(0, 7);
    return this.rootDir + yearAndMonth + ".json";
  }

  //投稿日からIDを生成
  private getIdByPostDate(postDate: string): string {
    // ファイル名で識別可能なようにyyyy-mmを先頭に付与
    const yearAndMonth = postDate.substr(0, 7);
    return yearAndMonth + uuid.v4();
  }
  // #endregion

  // #region deleteInfo

  private async deleteInfo(req: InfoPostRequest): Promise<string> {
    //ファイル名取得(idからファイル名を探す)
    const fileName = this.getFileNameFromId(req.postInfo.id);
    console.log("read a file", fileName);
    const infoList = await this.readInfoList(fileName);
    if (infoList === null) {
      console.error("delete info error while reading a file", req);
      return "delete info error while reading a file:" + fileName;
    }
    console.log("read result", infoList);
    // 削除
    let isDeleted = false;
    for (let i = 0; i < infoList.length; i++) {
      if (infoList[i].id === req.postInfo.id) {
        console.log("delete a info", infoList[i]);
        infoList.splice(i, 1);
        isDeleted = true;
        break;
      }
    }
    if (!isDeleted) {
      console.warn("no deleted a info:", req);
      return "no deleted a info";
    } else {
      //データ件数が0ならば削除異なるならば上書き
      if (infoList.length === 0) {
        console.log("info list is 0. delete a file");
        if (!(await this.deleteFile(fileName))) {
          return "delete a file error";
        }
      } else if (!(await this.uploadFile(JSON.stringify(infoList), fileName))) {
        return "save a file error";
      }
      console.log("save is successed", fileName);
    }
    return "";
  }

  private getFileNameFromId(id: string): string {
    //idの先頭のyyyy-mmを取り出す
    const yyyymm = id.substr(0, 7);
    return this.rootDir + yyyymm + ".json";
  }
  // #endregion
  // #endregion

  // #region getInfo
  // 日付リストの取得
  public async getDateList(): Promise<[Array<string>, string]> {
    let list = new Array<string>();
    const bucket = admin.storage().bucket(this.buketName);
    const options = { prefix: this.rootDir };
    try {
      // ファイル一覧を取得
      let [fileList] = await bucket.getFiles(options);
      if (fileList && fileList.length > 0) {
        //拡張子を除く
        list = fileList
          .filter(x => x.name.endsWith(".json"))
          .map(f => f.name.replace(this.rootDir, "").replace(".json", ""));
        //降順に並び替え
        list = list.sort((n1, n2) => {
          if (n1 > n2) {
            return -1;
          }
          if (n1 < n2) {
            return 1;
          }
          return 0;
        });
      }
    } catch (err) {
      console.error("file list get error", err);
      [null, "file list get error"];
    }

    return [list, ""];
  }

  // カウント数による記事の取得
  private async getInfoListByCount(
    req: InfoGetRequest
  ): Promise<[Array<Info>, string]> {
    let list = new Array<Info>();
    const bucket = admin.storage().bucket(this.buketName);
    const options = { prefix: this.rootDir };
    try {
      // ファイル一覧を取得
      let [fileList] = await bucket.getFiles(options);
      if (fileList && fileList.length > 0) {
        //ファイル名を降順
        console.log("fileList", fileList);
        fileList = fileList.sort((n1, n2) => {
          if (n1.name > n2.name) {
            return -1;
          }
          if (n1.name < n2.name) {
            return 1;
          }
          return 0;
        });
        // 順番に読み込む
        for (const file of fileList) {
          //jsonファイル以外は除外
          if (file.name.endsWith(".json")) {
            console.log("file read start:", file.name);
            const data = await bucket.file(file.name).download();
            const infoLis = this.getInfoListByJson(data.toString());
            if (infoLis && infoLis.length > 1) {
              //降順ソートして格納
              list = list.concat(this.sortByDateDesc(infoLis));
            }
            //最大値をこえたら終了
            if (list.length >= req.maxInfoCount) {
              console.log("max count is reached", list.length);
              break;
            }
          }
        }
        //余分な数をカット
        list = list.splice(0, req.maxInfoCount);
      }
      return [list, ""];
    } catch (err) {
      console.error("error is occured", err);
      return [[], "error is occured"];
    }
  }

  // 日付指定によるデータ取得
  private async getInfoListByDate(
    req: InfoGetRequest
  ): Promise<[Array<Info>, string]> {
    let list = new Array<Info>();
    const bucket = admin.storage().bucket(this.buketName);
    // 1カ月づつデータを取り出す
    let current = req.getStartDate();
    for (let i = 0; i < req.monthCount; i++) {
      console.log("currentMonth", current);
      const fileName = this.getFileNameByDate(current);
      console.log("read file start:", fileName);
      try {
        const isFileExists = await bucket.file(fileName).exists();
        if (isFileExists && isFileExists[0]) {
          const data = await bucket.file(fileName).download();
          const infoLis = this.getInfoListByJson(data.toString());
          if (infoLis && infoLis.length > 1) {
            list = list.concat(infoLis);
          }
          console.log("read file end:", fileName);
        } else {
          console.log("file is not exists:", fileName);
        }
      } catch (err) {
        console.warn(fileName + "is read fail", err);
      }

      // get next month
      current = new Date(current.setMonth(current.getMonth() + 1));
    }
    return [list, ""];
  }

  private getInfoListByJson(jsonStr: string): Array<Info> | null {
    const list = new Array<Info>();
    const obj = JSON.parse(jsonStr);
    if (!obj) {
      console.error("parse obj is null");
      return null;
    }
    if (!Array.isArray(obj)) {
      console.error("parse obj is not array");
      return null;
    }
    // 順に取り出して格納
    for (const item of obj) {
      if (typeof item === "object") {
        let id = "";
        let title = "";
        let content = "";
        let postDate = "";
        if (item.id && typeof item.id === "string") {
          id = item.id;
        }
        if (item.title && typeof item.title === "string") {
          title = item.title;
        }
        if (item.content && typeof item.content === "string") {
          content = item.content;
        }
        if (item.content && typeof item.content === "string") {
          content = item.content;
        }
        if (item.postDate && typeof item.postDate === "string") {
          postDate = item.postDate;
        }
        if (id !== "" && title !== "" && content !== "" && postDate !== "") {
          list.push(new Info(id, title, postDate, content));
        } else {
          console.error("some item param is error:", item);
        }
      } else {
        console.error("no object item:", item);
      }
    }
    return list;
  } // 日付の降順に並び替え
  private sortByDateDesc(infoList: Array<Info>): Array<Info> {
    return infoList.sort((n1, n2) => {
      if (n1.postDate > n2.postDate) {
        return -1;
      }
      if (n1.postDate < n2.postDate) {
        return 1;
      }
      return 0;
    });
  }

  // 日付形式からファイル名を取得します
  private getFileNameByDate(d: Date): string {
    const year = d.getFullYear().toString();
    const monthNum = d.getMonth() + 1;
    let monthStr = monthNum.toString();
    // フォーマット統一
    if (monthNum < 10) {
      monthStr = "0" + monthStr;
    }
    // ルートディレクトリを付与して返す
    return this.rootDir + year + "-" + monthStr + ".json";
  }
  //#endregion
}
