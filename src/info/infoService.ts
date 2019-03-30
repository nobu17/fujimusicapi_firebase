import InfoGetRequest from "./data/infoGetRequest";
import { InfoPostRequest } from "./data/infoPostRequest";
import { InfoGetResult, InfoErrorType } from "./data/infoGetResult";
import { InfoPostResult, InfoPostErrorType } from "./data/infoPostResult";
import InfoRepository from "./infoRepository";
import InfoGetDateRequest from "./data/infoGetDateRequest";
import InfoGetDateResult from "./data/infoGetDateResult";

export default class InfoService {
  private repository: InfoRepository;
  constructor() {
    this.repository = new InfoRepository();
  }
  public async postInfo(req: InfoPostRequest): Promise<InfoPostResult> {
    // 入力チェック
    const message = req.validateParam();
    if (message !== "") {
      return new InfoPostResult(null, message, InfoPostErrorType.paramError);
    }
    const result = await this.repository.postInfo(req);
    console.log("repository result:", result);
    if (result[1] === "") {
      return new InfoPostResult(result[0], "", InfoPostErrorType.none);
    } else {
      return new InfoPostResult(
        result[0],
        result[1],
        InfoPostErrorType.exception
      );
    }
  }

  public async getDateList(
    req: InfoGetDateRequest
  ): Promise<InfoGetDateResult> {
    // 入力チェック
    const message = req.validateParam();
    if (message !== "") {
      return new InfoGetDateResult([], message, InfoErrorType.paramError);
    }
    // 現状は引数無し
    const result = await this.repository.getDateList();
    if (result[1] !== "") {
      return new InfoGetDateResult([], result[1], InfoErrorType.exception);
    }
    if (result[0].length <= 0) {
      return new InfoGetDateResult([], "no data", InfoErrorType.noData);
    } else {
      return new InfoGetDateResult(result[0], "", InfoErrorType.none);
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
