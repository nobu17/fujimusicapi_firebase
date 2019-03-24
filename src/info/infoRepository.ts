import * as functions from "firebase-functions";
import { Info } from "./data/infoGetResult";
import InfoGetRequest from "./data/infoGetRequest";
import * as admin from "firebase-admin";

export default class InfoRepository {
  private readonly rootDir: string = "info/";
  private buketName: string;

  constructor() {
    this.buketName = functions.config().info.bucket.name;
    console.log("bucketName:", this.buketName);
  }

  public async getInfoList(req: InfoGetRequest): Promise<Array<Info>> {
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
    return list;
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
        let title = "";
        let content = "";
        let postDate = "";
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
        if (title !== "" && content !== "" && postDate !== "") {
          list.push(new Info(title, postDate, content));
        } else {
          console.error("some item param is error:", item);
        }
      } else {
        console.error("no object item:", item);
      }
    }
    return list;
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
}
