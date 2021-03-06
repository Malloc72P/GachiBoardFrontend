import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

class AreYouSureDialogData{
  msg1 : string;
  msg2 : string;
  isAlertMode :boolean = false;
}

@Component({
  selector: 'app-are-you-sure-panel',
  templateUrl: './are-you-sure-panel.component.html',
  styleUrls: ['./are-you-sure-panel.component.css']
})
export class AreYouSurePanelComponent implements OnInit {
  isAlertMode = false;
  constructor(
    public dialogRef: MatDialogRef<AreYouSurePanelComponent>,
    @Inject(MAT_DIALOG_DATA) public data:AreYouSureDialogData
  ) {
    this.isAlertMode = data.isAlertMode;
  }


  ngOnInit() {
  }
  onYesClick(): void {
    this.dialogRef.close(true);
  }
  onNoClick(): void {
    this.dialogRef.close(false);
  }
}
