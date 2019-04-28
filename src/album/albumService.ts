import { AlbumRepository } from "./albumRepository";
import { AlbumPostRequest, AlbumDeleteRequest } from "./data/albumPostRequest";
import {
  AlbumPostResult,
  AlbumDeleteResult,
  AlbumPostErrorType
} from "./data/albumPostResult";

export default class AlbumService {
  private repository: AlbumRepository;
  constructor() {
    this.repository = new AlbumRepository();
  }
  public async deleteAlbum(
    req: AlbumDeleteRequest
  ): Promise<AlbumDeleteResult> {
    const res = new AlbumDeleteResult();
    const errmsg = req.validate();
    if (errmsg !== "") {
      res.errorMessage = errmsg;
      res.errorType = AlbumPostErrorType.paramError;
      return res;
    }
    try {
      const repoRes = await this.repository.deleteAlbum(req);
      res.removeResults = repoRes.removeResults;
      return res;
    } catch (err) {
      console.error("repository err:", err);
      res.errorMessage = "un expected error";
      res.errorType = AlbumPostErrorType.exception;
      return res;
    }
  }
  public async postAlbum(req: AlbumPostRequest): Promise<AlbumPostResult> {
    return new Promise((resolve, reject) => {
      this.repository.postAlbum(req, res => {
        try {
          const result = new AlbumPostResult();
          if (res && res.errorMessage === "") {
            result.setParam(res);
          } else {
            if (res && !res.errorMessage) {
              result.errorMessage = "un excepted error";
            } else {
              result.errorMessage = res.errorMessage;
            }
            result.errorType = AlbumPostErrorType.exception;
          }
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    });
  }
}
