import * as functions from "firebase-functions";

export interface IAlbumPostRequest {
  getMethodType(): string;
}

// アルバムアップロード用
export class AlbumPostRequest implements IAlbumPostRequest {
  constructor(public req: functions.https.Request) {}

  public getMethodType(): string {
    return "albumPost";
  }
}