abstract class WhiteboardItem {
  private _id;
  private _groupId;
  private _type;


  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
  }

  get groupId() {
    return this._groupId;
  }

  set groupId(value) {
    this._groupId = value;
  }

  get type() {
    return this._type;
  }

  set type(value) {
    this._type = value;
  }
}
