import ClassroomInfoRequest from "./data/classroomInfoRequest";
import {
  ClassroomInfoResult,
  ClassroomErrorType
} from "./data/classroomInfoResult";
import ClassroomRepository from "./classroomRepository";

export default class ClassroomService {
  private repository: ClassroomRepository;
  constructor() {
    this.repository = new ClassroomRepository();
  }
  async getClassRoomInfo(
    req: ClassroomInfoRequest
  ): Promise<ClassroomInfoResult> {
    // 入力チェック
    const message = req.validateParam();
    if (message !== "") {
      //入力エラー
      console.error("input validation error", message);
      return new ClassroomInfoResult(
        [],
        [],
        message,
        ClassroomErrorType.paramError
      );
    }

    const result = await this.repository.getClassroomInfoList(req);
    // 成功件数がない
    if (result[0].length === 0) {
      return new ClassroomInfoResult(
        [],
        result[1],
        "there is no successClasses",
        ClassroomErrorType.noClasses
      );
    } else {
      // 失敗がある場合
      if (result[1].length !== 0) {
        return new ClassroomInfoResult(
          result[0],
          result[1],
          "partial fail class exists",
          ClassroomErrorType.partialError
        );
      } else {
        return new ClassroomInfoResult(
          result[0],
          [],
          "",
          ClassroomErrorType.none
        );
      }
    }
  }
}
