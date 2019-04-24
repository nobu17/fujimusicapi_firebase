import { FileResult, AlbumRepositoryPostResult } from "../albumRepository";

export enum AlbumPostErrorType {
  none,
  paramError,
  partialError,
  exception
}

export class AlbumPostResult {
  public uploadResults: FileResult;
  public moveResults: FileResult;
  public removeResults: FileResult;
  public errorMessage: string;
  public errorType: AlbumPostErrorType;
  constructor() {
    this.uploadResults = new FileResult();
    this.moveResults = new FileResult();
    this.removeResults = new FileResult();
    this.errorMessage = "";
    this.errorType = AlbumPostErrorType.none;
  }
  public setParam(res: AlbumRepositoryPostResult) {
    this.uploadResults = res.uploadResults;
    this.moveResults = res.moveResults;
    this.removeResults = res.removeResults;
    if (
      this.uploadResults.failList.length > 0 ||
      this.removeResults.failList.length > 0 ||
      this.moveResults.failList.length > 0
    ) {
      this.errorType = AlbumPostErrorType.partialError;
    }
  }
}
