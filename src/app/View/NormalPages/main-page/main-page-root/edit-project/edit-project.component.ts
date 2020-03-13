import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ProjectDto} from '../../../../../DTO/ProjectDto/project-dto';
import {ProjectRequesterService} from '../../../../../Controller/Project/project-requester.service';
import {ParticipantDto, ParticipantState} from '../../../../../DTO/ProjectDto/ParticipantDto/participant-dto';
import {HtmlHelperService} from '../../../../../Model/NormalPagesManager/HtmlHelperService/html-helper.service';
import {AuthorityLevel} from '../../../../../DTO/ProjectDto/ParticipantDto/authority-level.enum';
import {RestPacketDto} from '../../../../../DTO/RestPacketDto/RestPacketDto';
import {REST_RESPONSE} from '../../../../../Model/Helper/http-helper/http-helper';
import {AreYouSurePanelService} from '../../../../../Model/PopupManager/AreYouSurePanelManager/are-you-sure-panel.service';


export class EditProjectComponentData{
  projectDto:ProjectDto;
}

@Component({
  selector: 'app-edit-project',
  templateUrl: './edit-project.component.html',
  styleUrls: ['./edit-project.component.css',
    './../../../gachi-font.css',
    './../../../gachi-panel.css',
    '../../../../../../scrolling.scss'
  ]
})
export class EditProjectComponent implements OnInit {
  @ViewChild('kanbanEditForm') formEl: ElementRef<HTMLFormElement>;
  projectDto:ProjectDto;

  projectFormGroup:FormGroup;
  tempProjectTitle = "";
  tempParticipantList:Array<ParticipantDto>;

  authorityLevelList:Array<any>;
  public authorityLevelEnumData = AuthorityLevel;

  stateList:Array<any>;
  public stateEnumData = ParticipantState;


  constructor(
    public htmlHelper:HtmlHelperService,
    public dialogRef: MatDialogRef<EditProjectComponentData>,
    public projectRequesterService:ProjectRequesterService,
    public areYouSurePanelService:AreYouSurePanelService,
    @Inject(MAT_DIALOG_DATA) public data: EditProjectComponentData
  ) {
    this.projectDto = data.projectDto;
    this.tempParticipantList = new Array<ParticipantDto>();
    this.authorityLevelList = new Array<any>();
    this.stateList = new Array<any>();

    for( let key in this.authorityLevelEnumData ){
      if(this.authorityLevelEnumData.hasOwnProperty(key)) {
        let iterItem = this.authorityLevelEnumData[key];
        if(!isNaN(Number(iterItem))){
          this.authorityLevelList.push(iterItem);
        }
      }
    }

    for( let key in this.stateEnumData ){
      if(this.stateEnumData.hasOwnProperty(key)) {
        let iterItem = this.stateEnumData[key];
        if(!isNaN(Number(iterItem))){
          this.stateList.push(iterItem);
        }
      }
    }

    this.tempProjectTitle = this.projectDto.projectTitle;
    for(let participantDto of this.projectDto.participantList){
      let cloneParticipantDto:ParticipantDto = ParticipantDto.clone(participantDto);
      this.tempParticipantList.push(cloneParticipantDto);
    }

    this.projectFormGroup = new FormGroup({
      projectTitle: new FormControl(this.tempProjectTitle, [Validators.required,]),
    });

    for(let i = 0 ; i < this.tempParticipantList.length; i++){
      this.addControl(i);
    }
  }

  addControl(i) {
    console.log("KanbanGroupSettingComponent >> addControl >> i : ",i);

    this.projectFormGroup.addControl(
      'authorityLevel-' + i,
      new FormControl(this.tempParticipantList[i].authorityLevel)
    );
    this.projectFormGroup.addControl(
      'state-' + i,
      new FormControl(this.tempParticipantList[i].state)
    );
  }


  ngOnInit(): void {
  }
  onNoClick(): void {
    this.dialogRef.close({
      res : null
    });
  }

  onSubmit(){
    let isChanged = false;

    if(this.tempProjectTitle !== this.projectFormGroup.get("projectTitle").value){
      isChanged = true;
    }
    this.tempProjectTitle = this.projectFormGroup.get("projectTitle").value;
    console.log("EditProjectComponent >> onSubmit >> tempProjectTitle : ",this.tempProjectTitle);

    for(let i = 0 ; i < this.tempParticipantList.length; i++){
      let currPatricipant = this.tempParticipantList[i];
      if (currPatricipant.authorityLevel !== this.projectFormGroup.get('authorityLevel-' + i).value) {
        isChanged = true;
      }
      currPatricipant.authorityLevel = this.projectFormGroup.get('authorityLevel-' + i).value;
      if (currPatricipant.state !== this.projectFormGroup.get('state-' + i).value) {
        isChanged = true;
      }
      currPatricipant.state = this.projectFormGroup.get("state-"+i).value;
    }

    console.log("EditProjectComponent >> onSubmit >> tempParticipantList : ",this.tempParticipantList);

    if(isChanged === true){
      console.log("EditProjectComponent >> onSubmit >> 값 변경됨");
      this.projectDto.projectTitle = this.tempProjectTitle;
      this.projectDto.participantList = this.tempParticipantList;

      console.log("EditProjectComponent >> onSubmit >> projectDto : ",this.projectDto);

      this.projectRequesterService.requestUpdateProject(this.projectDto)
        .subscribe((response:RestPacketDto)=>{
          console.log("EditProjectComponent >> requestUpdateProject >> res : ",response);
          switch (response.action) {
            case REST_RESPONSE.ACK:
              this.dialogRef.close({res : response,});
              break;
            case REST_RESPONSE.NOT_AUTHORIZED:
              let subscription = this.areYouSurePanelService
                .openAreYouSurePanel(
                  "프로젝트를 수정할 권한이 부족합니다",
                  "프로젝트 매니저만 프로젝트를 수정할 수 있습니다.",
                  true)
                .subscribe(()=>{
                subscription.unsubscribe();
                  this.dialogRef.close({res : response});
              });
              break;
          }
        });
    }
    else{
      this.dialogRef.close({
        res : null,
      });
    }

/*
    this.projectRequesterService.createProject(projectTitle)
      .subscribe((data:ProjectDto)=>{
        console.log("CreateProjectComponent >> onSubmit >> data : ",data);
        this.dialogRef.close({
          projectDto : data,
        });

      });
*/
  }

  getProfileImg(profileImg){
    return this.htmlHelper.verifyProfileImage(profileImg);
  }
  getAuthLevelString(authLevel:AuthorityLevel){
    return AuthorityLevel[authLevel];
  }
  getStateString(state:ParticipantState){
    return ParticipantState[state];
  }

  getHeightOfBrowser() {
    return Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.documentElement.clientHeight
    );
  }


}
