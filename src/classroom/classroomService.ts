import ClassroomInfoRequest from "./data/classroomInfoRequest";
import {
  ClassroomInfoResult,
  ClassroomErrorType
} from "./data/classroomInfoResult";
import ClassroomRepository from "./classroomRepository";
import {
  ClassroomInfoPostRequest,
  ClassroomImagePostRequest
} from "./data/classroomPostRequest";
import {
  ClassroomPostResult,
  ClassroomImageResult,
  ClassroomPostErrorType
} from "./data/classroomPostResult";

export default class ClassroomService {
  private repository: ClassroomRepository;
  constructor() {
    this.repository = new ClassroomRepository();
  }
  public async getClassRoomInfo(
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

  public async postClassImage(
    req: ClassroomImagePostRequest
  ): Promise<ClassroomImageResult> {
    return new Promise((resolve, reject) => {
      this.repository.postClassImage(req, (suc, fail) => {
        try {
          if (suc.length === 0) {
            resolve(
              new ClassroomImageResult(
                suc,
                fail,
                "no succeeded fail",
                ClassroomPostErrorType.exception
              )
            );
            return;
          }
          if (suc.length > 0 && fail.length > 0) {
            resolve(
              new ClassroomImageResult(
                suc,
                fail,
                "partial fail",
                ClassroomPostErrorType.partialError
              )
            );
            return;
          } else {
            resolve(
              new ClassroomImageResult(
                suc,
                fail,
                "",
                ClassroomPostErrorType.none
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

  public async postClassInfo(
    req: ClassroomInfoPostRequest
  ): Promise<ClassroomPostResult> {
    // 入力チェック
    const message = req.validateParam();
    if (message !== "") {
      //入力エラー
      console.error("input validation error", message);
      return new ClassroomPostResult(
        [],
        [],
        message,
        ClassroomPostErrorType.paramError
      );
    }
    const result = await this.repository.postClassInfoToStore(req);
    if (!result) {
      return new ClassroomPostResult(
        [],
        [],
        "result is null",
        ClassroomPostErrorType.exception
      );
    }
    //失敗IDを格納
    const failList = new Array<string>();
    let errorMsg = "";
    result[1].forEach((v, k) => {
      failList.push(k);
      errorMsg += "classId:" + k + "," + v;
    });
    if (result[0].length > 0 && failList.length > 0) {
      return new ClassroomPostResult(
        result[0],
        failList,
        errorMsg,
        ClassroomPostErrorType.partialError
      );
    } else if (result[0].length > 0) {
      return new ClassroomPostResult(
        result[0],
        failList,
        errorMsg,
        ClassroomPostErrorType.none
      );
    } else {
      return new ClassroomPostResult(
        result[0],
        failList,
        errorMsg,
        ClassroomPostErrorType.exception
      );
    }
  }
}
