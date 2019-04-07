import { TopPageImagePostRequest } from "./data/topPageRequest";
import {
  TopPageImagePostResult,
  TopPagePostErrorType
} from "./data/topPageResult";

import TopPageRepository from "./topPageRepository";

export default class TopPageService {
  private repository: TopPageRepository;
  constructor() {
    this.repository = new TopPageRepository();
  }
  public async postTopPageImages(
    req: TopPageImagePostRequest
  ): Promise<TopPageImagePostResult> {
    return new Promise((resolve, reject) => {
      this.repository.postTopImage(req, (suc, fail) => {
        try {
          if (suc.length === 0) {
            resolve(
              new TopPageImagePostResult(
                suc,
                fail,
                "no succeeded fail",
                TopPagePostErrorType.exception
              )
            );
            return;
          }
          if (suc.length > 0 && fail.length > 0) {
            resolve(
              new TopPageImagePostResult(
                suc,
                fail,
                "partial fail",
                TopPagePostErrorType.partialError
              )
            );
            return;
          } else {
            resolve(
              new TopPageImagePostResult(
                suc,
                fail,
                "",
                TopPagePostErrorType.none
              )
            );
            return;
          }
        } catch (err) {
          reject(err);
        }
      });
    });
  }
}
