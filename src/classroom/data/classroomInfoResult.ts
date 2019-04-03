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
  public imageList: Array<ImageInfo> = new Array<ImageInfo>();
  constructor(
    public classId: string,
    public description: string,
    public lessonTimes: string,
    public lessonPlace: string
  ) {}
}

export class ImageInfo {
  constructor(public fileName: string, public fileUrl: string) {}
}

export enum ClassroomErrorType {
  none,
  paramError,
  noClasses,
  partialError,
  exception
}
