import InfoGetRequest from "./data/infoGetRequest";
import { InfoGetResult, InfoErrorType } from "./data/infoGetResult";
import InfoRepository from "./infoRepository";

export default class InfoService {
  private repository: InfoRepository;
  constructor() {
    this.repository = new InfoRepository();
  }
  public async getInfoList(req: InfoGetRequest): Promise<InfoGetResult> {
    // 入力チェック
    const message = req.validateParam();
    if (message !== "") {
      return new InfoGetResult([], message, InfoErrorType.paramError);
    }
    const rest = await this.repository.getInfoList(req);
    return new InfoGetResult(rest, "", InfoErrorType.none);
  }
}
