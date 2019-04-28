import * as functions from "firebase-functions";
import {
  IAlbumPostRequest,
  AlbumPostRequest,
  AlbumDeleteRequest
} from "./data/albumPostRequest";

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
  public getAlbumDeleteRequest(
    req: functions.https.Request
  ): IAlbumPostRequest | null {
    let res: IAlbumPostRequest | null;
    res = null;
    const contentType = req.get("content-type") as string;
    if (contentType.startsWith("application/json")) {
      if (
        Array.isArray(req.body.albumIdList) &&
        req.body.albumIdList.every((x: any) => typeof x === "string")
      ) {
        res = new AlbumDeleteRequest(req.body.albumIdList);
      } else {
        console.error("no match body:", req.body);
      }
    }
    return res;
  }
}
