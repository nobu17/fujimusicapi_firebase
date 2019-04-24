import { AlbumRepository } from "./albumRepository";
import { AlbumPostRequest } from "./data/albumPostRequest";
import { AlbumPostResult, AlbumPostErrorType } from "./data/albumPostResult";

export default class AlbumService {
  private repository: AlbumRepository;
  constructor() {
    this.repository = new AlbumRepository();
  }
  public async postTopPageImages(
    req: AlbumPostRequest
  ): Promise<AlbumPostResult> {
    return new Promise((resolve, reject) => {
      this.repository.postAlbumImages(req, res => {
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
