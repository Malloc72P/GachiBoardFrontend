import {EventEmitter, Injectable, Output} from '@angular/core';
import {KanbanItem} from '../../../../../View/Whiteboard/project-supporter-pannel/kanban/kanban.component';

export class TagItem{
  title:string;
  color:string;

  constructor(title, color){
    this.title = title;
    this.color = color;
  }
}


@Injectable({
  providedIn: 'root'
})
export class KanbanTagListManagerService {
  tagList:Array<TagItem>;

  @Output() onTagAddEvent:EventEmitter<any> = new EventEmitter<any>();
  @Output() onTagDeleteEvent:EventEmitter<any> = new EventEmitter<any>();

  constructor() {
    this.tagList = new Array<TagItem>();
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
  addTag(tagItem:TagItem) :Boolean{
    if(!this.isDuplicated(tagItem)){
      this.tagList.push(tagItem);
      this.emitTagAddEvent();
      return true;
    }
    else return false;
  }
  insertTagInTaglist(kanbanItem:KanbanItem, title, color){
    let newTag = new TagItem(title,color);
    kanbanItem.tagList.push(newTag);
    this.addTag(newTag);
  }
  deleteTagInTaglist(kanbanItem:KanbanItem, tagItem){
    const index = kanbanItem.tagList.indexOf(tagItem);
    if (index >= 0) {
      kanbanItem.tagList.splice(index, 1);
    }
    //this.removeTag(tagItem);
    //this.emitTagDeleteEvent(tagItem);
  }
  removeTag(tagItem:TagItem) :Boolean{
    for(let i = 0 ; i < this.tagList.length; i++){
      if(this.tagList[i].title === tagItem.title){
        this.tagList.splice(i,1);
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
