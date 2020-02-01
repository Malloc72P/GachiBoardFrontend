import {Editable} from '../../../InterfaceEditable/editable';
import {LinkEventEnum} from './link-event-enum.enum';

export class LinkEvent {
  private _action:LinkEventEnum;
  private _invokerItem;

  constructor(action, invokerItem) {
    this._action = action;
    this._invokerItem = invokerItem;
  }

  get action() {
    return this._action;
  }

  set action(value) {
    this._action = value;
  }

  get invokerItem() {
    return this._invokerItem;
  }

  set invokerItem(value) {
    this._invokerItem = value;
  }
}
