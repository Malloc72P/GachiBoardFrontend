import { Injectable } from '@angular/core';
import {MatDialog} from '@angular/material';
import {AreYouSurePanelComponent} from '../../../View/Commons/are-you-sure-panel/are-you-sure-panel.component';

@Injectable({
  providedIn: 'root'
})
export class AreYouSurePanelService {

  constructor(
    private dialog: MatDialog
  ) { }

  openAreYouSurePanel(msg1, msg2){
    const dialogRef = this.dialog.open(AreYouSurePanelComponent, {
      width: '480px',
      data: {
        msg1: msg1,
        msg2: msg2
      }
    });

    return dialogRef.afterClosed();
  }
}
