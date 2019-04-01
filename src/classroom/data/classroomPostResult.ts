export class ClassroomPostResult {
  constructor(
    public successClassIdList: Array<string>,
    public failClassIdList: Array<string>,
    public errorMessage: string,
    public errorType: ClassroomPostErrorType
  ) {}
}

export class ClassroomImageResult {
  constructor(
    public successFileList: Array<string>,
    public failFileList: Array<string>,
    public errorMessage: string,
    public errorType: ClassroomPostErrorType
  ) {}
}

export enum ClassroomPostErrorType {
  none,
  paramError,
  partialError,
  exception
}
