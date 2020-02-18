import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  QueryList, Renderer2,
  SimpleChanges,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {FormControl} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {MatAutocomplete, MatAutocompleteSelectedEvent, MatChip, MatChipInputEvent} from '@angular/material';
import {
  KanbanTagListManagerService,
  TagItem
} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanTagListManager/kanban-tag-list-manager.service';
import {AnimeManagerService, AnimeName} from '../../../../Model/AnimeManager/anime-manager.service';
import {KanbanItem} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanItem/kanban-item';
import {WsKanbanController} from '../../../../Controller/Controller-WebSocket/websocket-manager/KanbanWsController/ws-kanban.controller';
import {KanbanGroup} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanGroup/kanban-group';
import {WebsocketManagerService} from '../../../../Controller/Controller-WebSocket/websocket-manager/websocket-manager.service';
import {HtmlHelperService} from '../../../../Model/NormalPagesManager/HtmlHelperService/html-helper.service';
import {KanbanEvent, KanbanEventEnum} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanEvent/KanbanEvent';
import {KanbanEventManagerService} from '../../../../Model/Whiteboard/ProjectSupporter/Kanban/kanban-event-manager.service';


@Component({
  selector: 'app-kanban-tag-list',
  templateUrl: './kanban-tag-list.component.html',
  styleUrls: ['./kanban-tag-list.component.css', '../../../../../gachi-anime.scss','../../gachi-font.css']
})
export class KanbanTagListComponent implements OnInit,OnChanges {
  @ViewChildren('tagViewItem') tagViewList : QueryList<ElementRef>;

  @ViewChild('tagInput', {static: false}) tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', {static: false}) matAutocomplete: MatAutocomplete;
  @Input("kanbanItem") kanbanItem:KanbanItem;
  @Input("kanbanGroup") kanbanGroup:KanbanGroup;

  separatorKeysCodes: number[] = [ENTER, COMMA];
  constructor(
    private tagListMgrService:KanbanTagListManagerService,
    private animeManagerService:AnimeManagerService,
    private websocketManagerService:WebsocketManagerService,
    private htmlHelperService:HtmlHelperService,
  ){
  }



  ngOnInit() {
    this.isLocked = this.checkLocked();
    this.id += KanbanTagListComponent.idGenerator++;
    this.tagFormControl = new FormControl({selected : true});
    this.filteredTags = new Observable<TagItem[]>();
    this.allTags = this.tagListMgrService.getTagList();

    this.refreshAutoCompleteList();

    //태그 생성시 해당 이벤트 발생시킴
    this.tagListMgrService.getOnTagAddEvent()
      .subscribe(()=>{
        this.refreshAutoCompleteList();
      });
    //태그 제거시 해당 이벤트 발생시킴
    this.tagListMgrService.getOnTagDeleteEvent()
      .subscribe((data)=>{
        this.refreshAutoCompleteList();
        this.removeTagLocally(data);
      });

  }

  private static idGenerator = 0;
  id = 0;
  selectable = false;
  removable = true;
  addOnBlur = true;

  tagFormControl:FormControl;
  allTags: Array<TagItem>;
  filteredTags: Observable<TagItem[]>;


  checkLocked(){
    return this.kanbanItem.lockedBy && this.checkEditorIsAnotherUser(this.kanbanItem.lockedBy);
  }
  private isLocked = false;
  ngOnChanges(changes: SimpleChanges): void {

  }


  refreshAutoCompleteList(){
    this.filteredTags = this.tagFormControl.valueChanges.pipe(
      startWith(null),
      map((tagItem: TagItem | null) => {
        return tagItem ? this._filter(tagItem) : this.tagListMgrService.getTagList().slice();
      }));
  }

  add(event: MatChipInputEvent): void {
    let wsKanbanController = WsKanbanController.getInstance();
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;


      let newTagItem:TagItem = new TagItem(value.trim(), 'red');

      /*태그 추가 전에 이미 있는지 검사*/
      if(!this.isDuplicated(newTagItem)){
        /*태그 추가*/
        if ((value || '').trim()) {
          let newColor = this.generateRandomTagColor();
          this.tagListMgrService
            .insertTagInTaglist(this.kanbanItem, newTagItem.title, newColor, this.kanbanGroup)
            .subscribe((createdTag)=>{
              console.log("KanbanTagListComponent >> add >> insertTagInTaglist >> createdTag : ",createdTag);
              console.log("KanbanTagListComponent >>  >> kanbanItem : ",this.kanbanItem);

              wsKanbanController.waitRequestUpdateKanban(this.kanbanItem, this.kanbanGroup)
                .subscribe(()=>{
                    this.resetInputer(input);
                    wsKanbanController.requestUnlockKanban(this.kanbanItem, this.kanbanGroup);
                },
                  (e)=>{
                    this.resetInputer(input);
                    wsKanbanController.requestUnlockKanban(this.kanbanItem, this.kanbanGroup);
                });

            },(e)=>{
              console.log("KanbanTagListComponent >> add >> insertTagInTaglist >> e : ",e);
              this.resetInputer(input);
              wsKanbanController.requestUnlockKanban(this.kanbanItem, this.kanbanGroup);
            });
        }
      }
      else{
        //do Anime
        this.showUnavailable(newTagItem);
      }
      this.resetInputer(input);
    }

  }//add

  resetInputer(input){
    if (input) {
      input.value = '';
    }
    this.tagFormControl.setValue(null);
  }

  remove(tagItem: TagItem): void {
    this.tagListMgrService.deleteTagInTaglist(this.kanbanItem, tagItem);
  }
  removeTagLocally(tagItem: TagItem): void {
    //const index = this.kanbanItem.tagList.indexOf(tagItem);
    let index = -1;
    let tagList = this.kanbanItem.tagList;
    for(let i = 0 ; i < tagList.length; i++){
     if(tagList[i].title === tagItem.title){
       index = i;
       break;
     }
    }

    if (index >= 0) {
      this.kanbanItem.tagList.splice(index, 1);
    }
  }//remove

  selected(event: MatAutocompleteSelectedEvent): void {
    let newTagItem = new TagItem(event.option.viewValue.trim(), 'red');
    if(!this.isDuplicated(newTagItem)){
      this.kanbanItem.tagList.push(newTagItem);
    }
    else{
      this.showUnavailable(newTagItem);
    }
    this.tagInput.nativeElement.value  = "";
    this.tagFormControl.setValue(null);
  }//selected

  private _filter(value): TagItem[] {
    if(value === undefined){
      return null;
    }
    let filterValue;

    if(value instanceof TagItem){
      filterValue = value.title.toLowerCase();
    }
    else{
      filterValue = value.toLowerCase();
    }

    return this.allTags.filter((tagItem) => {
      return tagItem.title.toLowerCase().indexOf(filterValue) === 0;
    });
  }

  isDuplicated(tagItem:TagItem) :Boolean{
    let dupFlag = false;
    for(let i = 0 ; i < this.kanbanItem.tagList.length; i++){
      let currentTag = this.kanbanItem.tagList[i];
      if(currentTag.title === tagItem.title){
        dupFlag = true;
        break;
      }
    }
    return dupFlag;
  }
  showUnavailable(tagItem){
    this.tagViewList.forEach((value)=>{
      let elTitle = value.nativeElement.title;
      if( tagItem.title === elTitle ){
        let tgtEl = value.nativeElement;
        this.animeManagerService.doAnime(tgtEl, AnimeName.UNAVAILABLE);
      }
    });
  }

  onTagInputerFocusIn(){
    let wsKanbanController = WsKanbanController.getInstance();
    wsKanbanController.requestLockKanban(this.kanbanItem, this.kanbanGroup);
  }
  onTagInputerFocusOut(){
    let wsKanbanController = WsKanbanController.getInstance();
    // wsKanbanController.requestUnlockKanban(this.kanbanItem, this.kanbanGroup);
  }
  checkEditorIsAnotherUser(idToken){
    return this.websocketManagerService.userInfo.idToken !== idToken;
  }
  generateRandomTagColor(){
    let randNum = this.htmlHelperService.generateRand(0,3);
    switch (randNum) {
      case 0:
        return "primary";
      case 1:
        return "warn";
      case 2:
        return "accent";
      default:
        return "normal";
    }
  }




}
