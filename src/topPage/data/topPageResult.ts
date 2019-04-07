export class TopPageImagePostResult {
  constructor(
    public successFileList: Array<string>,
    public failFileList: Array<string>,
    public errorMessage: string,
    public errorType: TopPagePostErrorType
  ) {}
}

export enum TopPagePostErrorType {
  none,
  paramError,
  partialError,
  exception
}