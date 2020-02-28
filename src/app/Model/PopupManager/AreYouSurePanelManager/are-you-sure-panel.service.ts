import { Injectable } from '@angular/core';
import {AreYouSurePanelComponent} from '../../../View/Commons/are-you-sure-panel/are-you-sure-panel.component';
import {MatDialog} from '@angular/material/dialog';

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
