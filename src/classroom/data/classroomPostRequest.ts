import * as functions from "firebase-functions";

export interface IClassroomPost {
  getMethodType(): string;
}
// クラス情報を更新
export class ClassroomInfoPostRequest implements IClassroomPost {
  // classNames : カンマ区切り
  constructor(public classList: Array<ClassroomInfo>) {}

  // パラメータチェック。不正の場合エラーメッセージを返す
  public validateParam(): string {
    if (!this.classList || this.classList.length === 0) {
      return "classList is empty";
    }
    let finalMsg = "";
    // クラス情報ごとにチェック
    for (const cla of this.classList) {
      const msg = cla.validateParam();
      if (msg !== "") {
        finalMsg = msg;
        break;
      }
    }
    return finalMsg;
  }
  public getMethodType(): string {
    return "classInfo";
  }
}

// 画像アップロード用
export class ClassroomImagePostRequest implements IClassroomPost {
  constructor(public req: functions.https.Request) {}

  public getMethodType(): string {
    return "classImage";
  }
}

export class ClassroomInfo {
  constructor(
    public classId: string,
    public description: string,
    public lessonTimes: string,
    public lessonPlace: string
  ) {}

  // パラメータチェック。不正の場合エラーメッセージを返す
  public validateParam(): string {
    if (!this.classId || this.classId.trim() === "") {
      return "classId is empty";
    }
    if (!this.description || this.description.trim() === "") {
      return "description is empty";
    }
    if (!this.lessonTimes || this.lessonTimes.trim() === "") {
      return "lessonTimes is empty";
    }
    if (!this.lessonPlace || this.lessonPlace.trim() === "") {
      return "lessonPlace is empty";
    }
    return "";
  }
}
