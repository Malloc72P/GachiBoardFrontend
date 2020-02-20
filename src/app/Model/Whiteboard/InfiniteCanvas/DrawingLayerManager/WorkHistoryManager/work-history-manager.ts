import {EventEmitter} from '@angular/core';
import {ItemLifeCycleEnum, ItemLifeCycleEvent} from '../../../Whiteboard-Item/WhiteboardItemLifeCycle/WhiteboardItemLifeCycle';
import {WbItemWork} from './WbItemWork/wb-item-work';

import undoRedo from 'undo-redo-stack';
import {WhiteboardItemType} from '../../../../Helper/data-type-enum/data-type.enum';

export class WorkHistoryManager {

  //lce2 = WbItem Life Cycle Event Emitter
  private lce2:EventEmitter<any>;
  private static myInstance:WorkHistoryManager = null;

  dataCurrentArray: Array<WbItemWork> = [];
  dataUndoArray: Array<WbItemWork> = [];
  dataRedoArray: Array<WbItemWork> = [];

  undoLimit: number = 5;
  showUndo:boolean = false;
  showRedo:boolean = false;

  private constructor(lce2){
    console.log("WorkHistoryManager >> constructor >> 진입함");
    this.lce2 = lce2;

    this.subscribeLifeCycle();
  }

  private subscribeLifeCycle(){
    console.log("WorkHistoryManager >> subscribeLifeCycle >> 진입함");
    this.lce2.subscribe((lifeCycleEvent:ItemLifeCycleEvent)=>{
      if(lifeCycleEvent.item.type === WhiteboardItemType.GLOBAL_SELECTED_GROUP){
        return;
      }
      let newWbItemWork = new WbItemWork(lifeCycleEvent.action, lifeCycleEvent.item.exportToDto());
      this.pushIntoStack(newWbItemWork);
    });
  }

  public redoTask():WbItemWork{
    if(this.dataRedoArray.length > 0){
      this.redo();
      return this.dataCurrentArray[0];
    }else return null;

  }
  public undoTask():WbItemWork{
    if(this.dataUndoArray.length > 0){
      this.undo();
      return this.dataCurrentArray[0];
    }else return null;
  }


  clearAll(): void {
    this.dataCurrentArray = [];
    this.dataUndoArray = [];
    this.dataRedoArray = [];
    this.showUndo = false;
    this.showRedo = false;
  }

  private undo(): void {
    this.showRedo = true;
    if (this.dataUndoArray.length != 0) {
      this.dataRedoArray.push(this.dataCurrentArray.pop());
      this.dataCurrentArray.push(this.dataUndoArray.pop());
      if (this.dataUndoArray.length == 0) {
        this.showUndo = false;
      }
    }
  }
  private pushIntoStack(wbItemWork:WbItemWork){
    if (this.dataCurrentArray.length === 0) {
      this.dataCurrentArray.push(wbItemWork);
    } else {
      if (this.dataUndoArray.length == this.undoLimit) {
        this.dataUndoArray.reverse().pop();
        this.dataUndoArray.reverse();
      }
      this.dataUndoArray.push(this.dataCurrentArray.pop());
      this.dataCurrentArray.push(wbItemWork);
    }
  }

  private redo(): void {
    if (this.dataRedoArray.length != 0) {
      this.dataUndoArray.push(this.dataCurrentArray.pop());
      this.dataCurrentArray.push(this.dataRedoArray.pop());
      if (this.dataRedoArray.length == 0) {
        this.showRedo = false;
      }
    }

    if (this.dataUndoArray.length > 0) {
      this.showUndo = true;
    } else {
      this.showUndo = false;
    }
  }

  // ##### Initialize #####
  public static initInstance(lce2){
    console.log("WorkHistoryManager >> initInstance >> 진입함");
    if(!WorkHistoryManager.myInstance){
      WorkHistoryManager.myInstance = new WorkHistoryManager(lce2);
    }
    return this.myInstance;
  }

  public static getInstance(){
    return this.myInstance;
  }

}
