import * as functions from "firebase-functions";

export interface IAlbumPostRequest {
  getMethodType(): string;
}

export class AlbumPostRequest implements IAlbumPostRequest {
  constructor(public req: functions.https.Request) {}

  public getMethodType(): string {
    return "albumPost";
  }
}

export class AlbumDeleteRequest implements IAlbumPostRequest {
  constructor(public albumIdList: Array<string>) {}
  public getMethodType(): string {
    return "albumDelete";
  }
  public validate() :string {
      if(!this.albumIdList || this.albumIdList.length <= 0){
          return "no albumIdList eixsts";
      }
      return "";
  }
}
