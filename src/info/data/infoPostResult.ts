export class InfoPostResult {
  constructor(
    public errorMessage: string,
    public errorType: InfoPostErrorType
  ) {}
}

export enum InfoPostErrorType {
  none,
  paramError,
  exception
}
