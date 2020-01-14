import {Component, ElementRef, Input, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {MatAutocomplete, MatAutocompleteSelectedEvent, MatChip, MatChipInputEvent} from '@angular/material';
import {
  KanbanTagListManagerService,
  TagItem
} from '../../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanTagListManager/kanban-tag-list-manager.service';
import {AnimeManagerService, AnimeName} from '../../../../../Model/AnimeManager/anime-manager.service';
import {KanbanItem} from '../../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanItem/kanban-item';


@Component({
  selector: 'app-kanban-tag-list',
  templateUrl: './kanban-tag-list.component.html',
  styleUrls: ['./kanban-tag-list.component.css', '../../../../../../gachi-anime.scss']
})
export class KanbanTagListComponent implements OnInit {
  @ViewChildren('tagViewItem') tagViewList : QueryList<ElementRef>;

  @ViewChild('tagInput', {static: false}) tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', {static: false}) matAutocomplete: MatAutocomplete;
  @Input("kanbanItem") kanbanItem:KanbanItem;

  separatorKeysCodes: number[] = [ENTER, COMMA];

  ngOnInit() {
  }

  private static idGenerator = 0;
  id = 0;
  selectable = false;
  removable = true;
  addOnBlur = true;

  tagFormControl:FormControl;
  allTags: Array<TagItem>;
  filteredTags: Observable<TagItem[]>;

  constructor(
    private tagListMgrService:KanbanTagListManagerService,
    private animeManagerService:AnimeManagerService
  ){
    this.id += KanbanTagListComponent.idGenerator++;
    this.tagFormControl = new FormControl();
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
      })
  }

  refreshAutoCompleteList(){
    this.filteredTags = this.tagFormControl.valueChanges.pipe(
      startWith(null),
      map((tagItem: TagItem | null) => {
        return tagItem ? this._filter(tagItem) : this.tagListMgrService.getTagList().slice();
      }));
  }

  add(event: MatChipInputEvent): void {
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;


      let newTagItem = new TagItem(value.trim(), 'red');

      /*태그 추가 전에 이미 있는지 검사*/
      if(!this.isDuplicated(newTagItem)){
        /*태그 추가*/
        if ((value || '').trim()) {
          this.tagListMgrService.insertTagInTaglist(this.kanbanItem, newTagItem.title, newTagItem.color);
        }
      }
      else{
        //do Anime
        this.showUnavailable(newTagItem);
      }
      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.tagFormControl.setValue(null);
    }

  }//add
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

}
