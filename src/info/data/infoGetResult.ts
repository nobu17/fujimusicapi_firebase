export class InfoGetResult {
    constructor(public infoList:Array<Info>, public errorMessage:string, public errorType:InfoErrorType){}
}

export class Info {
  constructor(
    public id: string,
    public title: string,
    public postDate: string,
    public content: string
  ) {}
}

export enum InfoErrorType {
  none,
  paramError,
  noData,
  exception
}