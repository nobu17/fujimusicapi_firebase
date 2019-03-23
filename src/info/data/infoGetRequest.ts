export default class InfoGetRequest {
  // start : 開始日時YYYYMM end: 終了日時YYYYMM
  constructor(public start: string, public end: string) {}

  // パラメータチェック。不正の場合エラーメッセージを返す
  public validateParam(): string {
    // start check
    if (!this.start || this.start.trim() === "") {
      return "start is empty";
    }
    const stRes = this.checkDate(this.start);
    if (!stRes[0]) {
      return "start is error" + stRes[1];
    }

    // end check
    if (!this.end || this.end.trim() === "") {
      return "end is empty";
    }
    const enRes = this.checkDate(this.end);
    if (!enRes[0]) {
      return "start is error" + enRes[1];
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
