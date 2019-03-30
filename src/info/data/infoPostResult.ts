import { Info } from "./infoGetResult";

export class InfoPostResult {
  constructor(
    public storedInfo: Info | null,
    public errorMessage: string,
    public errorType: InfoPostErrorType
  ) {}
}

export enum InfoPostErrorType {
  none,
  paramError,
  exception
}
