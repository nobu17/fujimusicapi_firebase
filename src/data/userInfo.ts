export class UserInfo {
  constructor(
    public userId: string,
    public password: string,
    public role: string
  ) {}
}

export class UserList {
  constructor(public userList: Array<UserInfo>) {}

  public findUser(userId: string): UserInfo | null {
    const mathes = this.userList.find(usr => {
      //console.log("usr.usrId", usr.userId);
      //console.log("userId", userId);
      if (usr.userId === userId) {
        return true;
      }
      return false;
    });

    if (mathes) {
      return mathes;
    }
    return null;
  }
}
