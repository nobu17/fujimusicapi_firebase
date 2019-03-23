export default class ClassroomInfoRequest {
  // classNames : カンマ区切り
  constructor(public classNames: string) {}

  // パラメータチェック。不正の場合エラーメッセージを返す
  public validateParam(): string {
    if (!this.classNames || this.classNames.trim() === "") {
      return "classNames is empty";
    } else {
      return "";
    }
  }
  public getClassList(): Array<string>{
      return this.classNames.split(",");
  }
}
