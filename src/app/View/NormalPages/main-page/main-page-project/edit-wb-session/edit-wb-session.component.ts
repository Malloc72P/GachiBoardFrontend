import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CreateWbSessionComponentData} from '../create-wb-session/create-wb-session.component';
import {WhiteboardSessionDto} from '../../../../../DTO/ProjectDto/WhiteboardSessionDto/whiteboard-session-dto';
import {WsWhiteboardSessionController} from '../../../../../Controller/Controller-WebSocket/websocket-manager/WhiteboardSessionWsController/ws-whiteboard-session.controller';

export class EditWbSessionComponentData{
  wbSessionDto:WhiteboardSessionDto;

  constructor(wbSessionDto: WhiteboardSessionDto) {
    this.wbSessionDto = wbSessionDto;
  }
}

@Component({
  selector: 'app-edit-wb-session',
  templateUrl: './edit-wb-session.component.html',
  styleUrls: [
    './edit-wb-session.component.css',
    './../../../gachi-font.css',
    './../../../gachi-panel.css'
  ]
})
export class EditWbSessionComponent implements OnInit {
  wbSessionFormGroup:FormGroup;
  wbSessionDto:WhiteboardSessionDto;

  originWbSessionTitle = "";
  constructor(
    public dialogRef: MatDialogRef<CreateWbSessionComponentData>,
    @Inject(MAT_DIALOG_DATA) public data: EditWbSessionComponentData
  ) {
    this.wbSessionDto = data.wbSessionDto;
    this.originWbSessionTitle = data.wbSessionDto.title;
    this.wbSessionFormGroup = new FormGroup({
      title : new FormControl(data.wbSessionDto.title, [Validators.required,]),
    });

  }


  ngOnInit(): void {
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(){
    let currentWbSessionTitle = this.wbSessionFormGroup.get("title").value;
    if(currentWbSessionTitle !== this.originWbSessionTitle){
      //수정이 발생한 경우
      let updateWbSessionDto:WhiteboardSessionDto = new WhiteboardSessionDto();
      updateWbSessionDto._id = this.wbSessionDto._id;
      updateWbSessionDto.title = currentWbSessionTitle;
      let wsWbSessionController = WsWhiteboardSessionController.getInstance();
      let subscription = wsWbSessionController.waitRequestUpdateWbSession(updateWbSessionDto)
        .subscribe(()=>{
        subscription.unsubscribe();
          this.dialogRef.close();
      });
    }else{//안바뀐 경우
      this.dialogRef.close();
    }
  }

}
