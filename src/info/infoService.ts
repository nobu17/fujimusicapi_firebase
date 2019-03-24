import InfoGetRequest from "./data/infoGetRequest";
import { InfoPostRequest } from "./data/infoPostRequest";
import { InfoGetResult, InfoErrorType } from "./data/infoGetResult";
import { InfoPostResult, InfoPostErrorType } from "./data/infoPostResult";
import InfoRepository from "./infoRepository";

export default class InfoService {
  private repository: InfoRepository;
  constructor() {
    this.repository = new InfoRepository();
  }
  public async postInfo(req: InfoPostRequest): Promise<InfoPostResult> {
    // 入力チェック
    const message = req.validateParam();
    if (message !== "") {
      return new InfoPostResult(message, InfoPostErrorType.paramError);
    }
    const result = await this.repository.postInfo(req);
    if (result && result !== "") {
      return new InfoPostResult("", InfoPostErrorType.none);
    } else {
      return new InfoPostResult(result, InfoPostErrorType.exception);
    }
  }

  // 記事情報を取得します
  public async getInfoList(req: InfoGetRequest): Promise<InfoGetResult> {
    // 入力チェック
    const message = req.validateParam();
    if (message !== "") {
      return new InfoGetResult([], message, InfoErrorType.paramError);
    }
    const result = await this.repository.getInfoList(req);
    if (result[1] !== "") {
      return new InfoGetResult([], result[1], InfoErrorType.exception);
    }
    if (result[0].length <= 0) {
      return new InfoGetResult([], "no data", InfoErrorType.noData);
    } else {
      return new InfoGetResult(result[0], "", InfoErrorType.none);
    }
  }
}
