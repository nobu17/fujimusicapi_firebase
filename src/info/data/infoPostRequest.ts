export class InfoPostRequest {
  private modeTypeList: Array<string> = ["make", "edit", "delete"];
  constructor(public postType: string, public postInfo: PostInfo) {}

  // パラメータチェック。不正の場合エラーメッセージを返す
  public validateParam(): string {
    const postType = this.postType;
    if (!this.postType || !this.modeTypeList.some(x => x === postType)) {
      return "postType is empty or not supported mode";
    }
    if (!this.postInfo) {
      return "postInfo is empty";
    }
    //makeの場合はid以外すべて指定必要
    if (this.isMakeMode()) {
      if (!this.postInfo.title || this.postInfo.title === "") {
        return "title is empty";
      }
      if (!this.postInfo.postDate || this.postInfo.postDate === "") {
        return "postDate is empty";
      }
      if (!this.postInfo.content || this.postInfo.content === "") {
        return "content is empty";
      }
    } else if (this.isEditMode()) {
      //編集の場合IDも必要
      if (!this.postInfo.id || this.postInfo.id === "") {
        return "id is empty";
      }
      if (!this.postInfo.title || this.postInfo.title === "") {
        return "title is empty";
      }
      if (!this.postInfo.postDate || this.postInfo.postDate === "") {
        return "postDate is empty";
      }
      if (!this.postInfo.content || this.postInfo.content === "") {
        return "content is empty";
      }
    } else if (this.isDeleteMode()) {
      //削除の場合IDのみ必要
      if (!this.postInfo.id || this.postInfo.id === "") {
        return "id is empty";
      }
    }
    return "";
  }

  public isMakeMode(): boolean {
    if (this.postType === this.modeTypeList[0]) {
      return true;
    }
    return false;
  }
  public isEditMode(): boolean {
    if (this.postType === this.modeTypeList[1]) {
      return true;
    }
    return false;
  }
  public isDeleteMode(): boolean {
    if (this.postType === this.modeTypeList[2]) {
      return true;
    }
    return false;
  }
}

export class PostInfo {
  constructor(
    public id: string,
    public title: string,
    public postDate: string,
    public content: string
  ) {}
}
