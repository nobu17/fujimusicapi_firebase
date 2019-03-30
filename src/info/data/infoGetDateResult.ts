import { InfoErrorType } from "./infoGetResult";

export default class InfoGetDateResult {
    constructor(public dateList:Array<string>, public errorMessage:string, public errorType:InfoErrorType){}
}
