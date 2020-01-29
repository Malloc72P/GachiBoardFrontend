import {WhiteboardItem} from '../../../Whiteboard-Item/whiteboard-item';

export class SelectEvent {
  private _action;
  private _invokerWbItem:WhiteboardItem;
  constructor(action, invoker:WhiteboardItem) {
    this.action = action;
    this.invokerWbItem = invoker;
  }

  get action() {
    return this._action;
  }

  set action(value) {
    this._action = value;
  }

  get invokerWbItem(): WhiteboardItem {
    return this._invokerWbItem;
  }

  set invokerWbItem(value: WhiteboardItem) {
    this._invokerWbItem = value;
  }
}
