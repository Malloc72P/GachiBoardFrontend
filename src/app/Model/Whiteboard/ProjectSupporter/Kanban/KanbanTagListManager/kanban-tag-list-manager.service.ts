import {EventEmitter, Injectable, Output} from '@angular/core';
import {KanbanItem} from '../KanbanItem/kanban-item';
import {KanbanTagDto} from '../../../../../DTO/ProjectDto/KanbanDataDto/KanbanTagDto/kanban-tag-dto';
import {WsKanbanController} from '../../../../../Controller/Controller-WebSocket/websocket-manager/KanbanWsController/ws-kanban.controller';
import {HtmlHelperService} from '../../../../NormalPagesManager/HtmlHelperService/html-helper.service';
import {KanbanGroup} from '../KanbanGroup/kanban-group';
import {KanbanEvent, KanbanEventEnum} from '../KanbanEvent/KanbanEvent';
import {KanbanEventManagerService} from '../kanban-event-manager.service';
import {Observable} from 'rxjs';

export class TagItem{
  public _id;
  title:string;
  color:string;
  constructor(title, color){
    this.title = title;
    this.color = color;
  }
  exportDto(){
    let tagDto = new KanbanTagDto();
    tagDto._id = this._id;
    tagDto.title = this.title;
    tagDto.color = this.color;
    return tagDto;
  }
}


@Injectable({
  providedIn: 'root'
})
export class KanbanTagListManagerService {
  tagList:Array<TagItem>;

  @Output() onTagAddEvent:EventEmitter<any> = new EventEmitter<any>();
  @Output() onTagDeleteEvent:EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private kanbanEventManager:KanbanEventManagerService,
    ) {
    this.tagList = new Array<TagItem>();
    this.subscribeEventEmitter();
  }
  subscribeEventEmitter(){
    this.kanbanEventManager.kanbanEventEmitter.subscribe((kanbanEvent:KanbanEvent)=>{
      switch (kanbanEvent.action) {
        case KanbanEventEnum.CREATE_TAG:
          this.addTag(kanbanEvent.data);
          break;
        case KanbanEventEnum.LOCK:
          break;
      }

    });
  }
  getOnTagAddEvent(){
    return this.onTagAddEvent;
  }
  getOnTagDeleteEvent(){
    return this.onTagDeleteEvent;
  }

  emitTagAddEvent(){
    this.onTagAddEvent.emit();
  }
  emitTagDeleteEvent(data){
    this.onTagDeleteEvent.emit(data);
  }

  getTagList(){
    return this.tagList;
  }
  addTags(paramTagList:Array<TagItem>){
    if(paramTagList === undefined){
      return;
    }
    paramTagList.forEach((value, index)=>{
      console.log("KanbanTagListManagerService >> paramTagList >> forEach : ",value);
      this.addTag(value);
    });
  }
  addTag(tagItem:TagItem) :Boolean{//태그 관리 서비스에 태그를 등록시키는 메서드
    if(!this.isDuplicated(tagItem)){
      this.tagList.push(tagItem);//태크리스트에 추가함
      this.emitTagAddEvent();//태그가 추가되었음을 알림. 다른 태그리스트컴포넌트들은 이 이벤트를 받고
      //자신들의 자동완성 리스트에 해당 태그를 추가함.
      return true;
    }
    else return false;
  }
  insertTagInTaglist(kanbanItem:KanbanItem, title, color, kanbanGroup:KanbanGroup):Observable<any>{
    return new Observable<any>((subscriber) => {
      let newTag:TagItem = new TagItem(title,color);
      //#### 여기서 WS 요청 필요 - 생성
      let wsKanbanController = WsKanbanController.getInstance();
      wsKanbanController.waitRequestCreateKanbanTag(newTag)
        .subscribe((newKanbanTagDto:KanbanTagDto)=>{
          wsKanbanController.requestUnlockKanban(kanbanItem, kanbanGroup);
          kanbanItem.tagList.push(newTag);//이걸로 해당 칸반 아이템에 태그가 삽입됨
          this.addTag(newTag);//태그관리 서비스에 태그가 등록됨
          subscriber.next(newTag);
        },(e)=>{
          console.warn("KanbanTagListManagerService >>  >> e : ",e);
          subscriber.error(newTag);
        })
    });
  }
  insertTagInTaglistByWs(kanbanItem:KanbanItem, title, color){
    //Ws에 의한 태그 삽입.
    let newTag = new TagItem(title,color);
    kanbanItem.tagList.push(newTag);//이걸로 해당 칸반 아이템에 태그가 삽입됨
    this.addTag(newTag);//태그관리 서비스에 태그가 등록됨
  }
  deleteTagInTaglist(kanbanItem:KanbanItem, tagItem){
    const index = kanbanItem.tagList.indexOf(tagItem);
    if (index >= 0) {
      kanbanItem.tagList.splice(index, 1);
    }
  }
  deleteTagInTaglistByWs(kanbanItem:KanbanItem, tagItem){
    const index = kanbanItem.tagList.indexOf(tagItem);
    if (index >= 0) {
      kanbanItem.tagList.splice(index, 1);
    }
    //칸반 아이템 업데이트 요청을 여기서 할 것
  }
  removeTag(tagItem:TagItem) :Boolean{
    for(let i = 0 ; i < this.tagList.length; i++){
      if(this.tagList[i].title === tagItem.title){
        this.tagList.splice(i,1);
        this.emitTagDeleteEvent(tagItem);
        return true;
      }
    }
    return false;
  }
  isDuplicated(tagItem:TagItem) :Boolean{
    for(let i = 0 ; i < this.tagList.length; i++){
      if(this.tagList[i].title === tagItem.title){
        return true;
      }
    }
    return false;
  }
}
