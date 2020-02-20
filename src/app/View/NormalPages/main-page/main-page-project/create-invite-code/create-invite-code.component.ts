import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ProjectDto} from '../../../../../DTO/ProjectDto/project-dto';
import {MAT_DIALOG_DATA, MatDialogRef, MatSlider, MatStepper} from '@angular/material';
import {AuthRequestService} from '../../../../../Controller/SocialLogin/auth-request/auth-request.service';
import {ProjectRequesterService} from '../../../../../Controller/Project/project-requester.service';
import {HttpHelper} from '../../../../../Model/Helper/http-helper/http-helper';

export class CreateInviteCodeComponentData{
  projectDto:ProjectDto;

  constructor(projectDto: ProjectDto) {
    this.projectDto = projectDto;
  }
}


@Component({
  selector: 'app-create-invite-code',
  templateUrl: './create-invite-code.component.html',
  styleUrls: ['./create-invite-code.component.css',
  './../../../gachi-font.css','./../../../gachi-panel.css']
})
export class CreateInviteCodeComponent implements OnInit {
  @ViewChild('stepper', {static: false}) stepper: MatStepper;
  @ViewChild('remainSlider', {static: false}) remainSlider;
  inviteCodeFormGroup:FormGroup;
  finishFormGroup:FormGroup;

  private projectDto:ProjectDto;
  private inviteCode = "";
  private inviteUrl = "";

  constructor(
    private dialogRef: MatDialogRef<CreateInviteCodeComponentData>,
    private authRequestService:AuthRequestService,
    private projectRequesterService:ProjectRequesterService,
    private _formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: CreateInviteCodeComponentData
  ) {
    this.projectDto = data.projectDto;
  }

  ngOnInit() {
    this.inviteCodeFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.finishFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
  }

  onSubmit(){

  }
  onGenerateCodeBtnClick(){
    /*this.stepper.selectedIndex = 1;*/
    //this.inviteCodeFormGroup.
    let remainCount = this.remainSlider.value;
    console.log("CreateInviteCodeComponent >> onGenerateCodeBtnClick >> projectDto : ",this.projectDto);
    this.projectRequesterService.generateInviteCode(this.projectDto._id, remainCount)
      .subscribe((data)=>{
      console.log("CreateInviteCodeComponent >>  >> data : ",data);
        if (data.inviteCode) {
          this.inviteCode = data.inviteCode;
          this.inviteUrl = HttpHelper.ngUrl + HttpHelper.api.project.invitation.uri + ";inviteCode=" + this.inviteCode;
          this.stepper.selectedIndex = 1;
        }
    })
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  formatLabel(value: number) {
    return value + "명";
  }
  onCopyBtnClick(){
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.inviteUrl;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

}
