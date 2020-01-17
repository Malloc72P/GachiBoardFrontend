import {Component, ElementRef, Inject, Input, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {MAT_DIALOG_DATA, MatAutocomplete, MatAutocompleteSelectedEvent, MatChipInputEvent, MatDialogRef} from '@angular/material';
import {UserManagerService} from '../../../../../Model/UserManager/user-manager.service';
import {KanbanItemColorService} from '../../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanItemColorEnumManager/kanban-item-color.service';
import {EditKanbanDialogData} from '../kanban-item-edit/kanban-item-edit.component';
import {
  KanbanTagListManagerService,
  TagItem
} from '../../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanTagListManager/kanban-tag-list-manager.service';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {AnimeManagerService, AnimeName} from '../../../../../Model/AnimeManager/anime-manager.service';
import {KanbanItem} from '../../../../../Model/Whiteboard/ProjectSupporter/Kanban/KanbanItem/kanban-item';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {AreYouSurePanelService} from '../../../../../Model/PopupManager/AreYouSurePanelManager/are-you-sure-panel.service';

@Component({
  selector: 'app-kanban-tag-management',
  templateUrl: './kanban-tag-management.component.html',
  styleUrls: ['./kanban-tag-management.component.css', '../../../../../../gachi-anime.scss']
})
export class KanbanTagManagementComponent implements OnInit {
  isErrored = false;
  errMsg = "";
  @ViewChildren('tagViewItem') tagViewList : QueryList<ElementRef>;

  @ViewChild('tagInput', {static: false}) tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', {static: false}) matAutocomplete: MatAutocomplete;

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
    public dialogRef: MatDialogRef<KanbanTagManagementComponent>,
    private userManagerService:UserManagerService,
    private colorService:KanbanItemColorService,
    private tagMgrService:KanbanTagListManagerService,
    private areYouSurePanelService:AreYouSurePanelService,
    private animeManagerService:AnimeManagerService
  ) {
    this.id += KanbanTagManagementComponent.idGenerator++;
    this.tagFormControl = new FormControl();
    this.filteredTags = new Observable<TagItem[]>();
    this.allTags = this.tagMgrService.getTagList();

    this.refreshAutoCompleteList();

  }

  refreshAutoCompleteList(){
    this.filteredTags = this.tagFormControl.valueChanges.pipe(
      startWith(null),
      map((tagItem: TagItem | null) => {
        return tagItem ? this._filter(tagItem) : this.tagMgrService.getTagList().slice();
      }));
  }

  add(event: MatChipInputEvent): void {
    if (!this.matAutocomplete.isOpen) {
      console.log("KanbanTagManagementComponent >> add >> event : ",event);
      const input = event.input;
      const value = event.value;


      let newTagItem = new TagItem(value.trim(), 'red');

      /*태그 추가 전에 이미 있는지 검사*/
      if(!this.isDuplicated(newTagItem)){
        /*태그 추가*/
        if ((value || '').trim()) {
          console.log("KanbanTagManagementComponent >> add >> newTagItem : ",newTagItem);
          //this.tagMgrService.insertTagInTaglist(this.kanbanItem, newTagItem.title, newTagItem.color);
          this.tagMgrService.addTag(newTagItem);
        }
      }
      else{
        //do Anime

      }
      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.tagFormControl.setValue(null);
    }

  }//add
  remove(tagItem: TagItem): void {
    //this.tagMgrService.deleteTagInTaglist(this.kanbanItem, tagItem);\
    this.areYouSurePanelService.openAreYouSurePanel(
      "정말로 삭제하시겠습니까?",
      "해당 작업은 되돌릴 수 없습니다"
    ).subscribe((result)=>{
      if(result){
        this.tagMgrService.removeTag(tagItem);
      }
    });
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    let title = event.option.viewValue.trim();
    this.tagInput.nativeElement.value  = title;
    this.tagFormControl.setValue(title);
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
    let tagList = this.tagMgrService.getTagList();
    for(let i = 0 ; i < tagList.length; i++){
      let currentTag = tagList[i];
      if(currentTag.title === tagItem.title){
        console.log("KanbanTagManagementComponent >> isDuplicated >> 중복발견");
        this.showUnavailable(tagItem);
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
        this.setError("이미 존재하는 태그입니다");
        this.animeManagerService.doAnime(tgtEl, AnimeName.UNAVAILABLE);
      }
    });

  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  setError(msg){
    this.isErrored = true;
    this.errMsg = msg;
  }

}