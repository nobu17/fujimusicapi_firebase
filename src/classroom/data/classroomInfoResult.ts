export class ClassroomInfoResult {
  // classNames : カンマ区切り
  constructor(
    public classroomList: Array<ClassroomInfo>,
    public failClassIdList: Array<string>,
    public errorMessage: string,
    public errorType: ClassroomErrorType
  ) {}
}

export class ClassroomInfo {
  public imageList: Array<string> = new Array<string>();
  constructor(
    public classId: string,
    public description: string,
    public lessonTimes: string,
    public lessonPlace: string
  ) {}
}

export enum ClassroomErrorType {
  none,
  paramError,
  noClasses,
  partialError,
  exception
}
