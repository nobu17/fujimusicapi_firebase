import * as functions from "firebase-functions";
import { IAlbumPostRequest, AlbumPostRequest } from "./data/albumPostRequest";

export default class HttpReqGetter {
  public getAlbumPostRequest(
    req: functions.https.Request
  ): IAlbumPostRequest | null {
    let res: IAlbumPostRequest | null;
    res = null;
    const contentType = req.get("content-type") as string;
    if (contentType.startsWith("multipart/form-data")) {
      res = new AlbumPostRequest(req);
    }
    return res;
  }
}
