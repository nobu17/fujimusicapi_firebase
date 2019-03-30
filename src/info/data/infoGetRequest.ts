import IGetRequest from "./iGetRequest";
export default class InfoGetRequest implements IGetRequest {
  // start : 開始日時YYYYMM end: 終了日時YYYYMM
  constructor(
    public mode: string, //入力タイプ(count,date)
    public start: string, //dateの場合に使用 開始年月日yyyymm
    public monthCount: number, // dateの場合に使用 開始年月からのカウント
    public maxInfoCount: number // countまたはdateで使用。最大取得数
  ) {}

  public getStartDate(): Date {
    return new Date(
      parseInt(this.start.substr(0, 4)),
      parseInt(this.start.substr(4, 2)) - 1
    );
  }
  // パラメータチェック。不正の場合エラーメッセージを返す
  public validateParam(): string {
    if (this.mode !== "count" && this.mode !== "date") {
      return "mode error(only count or date or dateList)";
    }

    // 日付モードの場合
    if (this.mode === "date") {
      // start check
      if (!this.start || this.start.trim() === "") {
        return "start is empty";
      }
      const stRes = this.checkDate(this.start);
      if (!stRes[0]) {
        return "start is error" + stRes[1];
      }

      // monthcount check
      if (this.monthCount <= 0) {
        return "monthCount is under zero";
      }
      if (this.monthCount > 6) {
        return "max montCount is 6";
      }
    }

    // maxInfoCount check
    if (this.maxInfoCount <= 0) {
      return "maxInfoCount is under zero";
    }
    if (this.maxInfoCount > 50) {
      return "max maxInfoCount is 50";
    }
    return "";
  }

  private checkDate(date: string): [boolean, string] {
    if (date.length !== 6) {
      return [false, "not string length is 6"];
    }
    const yyyy = parseInt(date.substr(0, 4));
    const mm = parseInt(date.substr(4, 2));
    if (isNaN(yyyy)) {
      return [false, "yyyy is not number"];
    }
    // 2000年から2100年まで
    if (yyyy <= 2000 || yyyy > 2100) {
      return [false, "yyyy is out of range(2000-2100)"];
    }
    if (isNaN(mm)) {
      return [false, "mm is not number"];
    }
    // 1-12月
    if (mm < 1 || mm > 12) {
      return [false, "mm is out of range(1-12)"];
    }

    return [true, ""];
  }
}
