import IGetRequest from "./iGetRequest";

export default class InfoGetDateRequest implements IGetRequest {
  constructor(
    public mode: string, //入力タイプ(dateList)
    public listType: string //リストタイプ(yearAndMonthのみ)
  ) {}
  public validateParam(): string {
    if (this.mode !== "dateList") {
      return "mode is error. only dateList";
    }      
    if (!this.listType || this.listType !== "yearAndMonthList") {
      return "listType is error. only yearAndMonthList";
    }
    return "";
  }
}
