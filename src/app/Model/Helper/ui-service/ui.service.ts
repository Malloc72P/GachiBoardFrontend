import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';
import {Overlay} from '@angular/cdk/overlay';
import {ComponentPortal} from '@angular/cdk/portal';
import {map, scan} from 'rxjs/operators';
import {MatSpinner} from '@angular/material/progress-spinner';

@Injectable({
  providedIn: 'root'
})
export class UiService {

  private spinnerTopRef = this.cdkSpinnerCreate();

  spin$ :Subject<boolean> = new Subject();

  constructor(
    private overlay: Overlay,
  ) {

    this.spin$
      .asObservable()
      .pipe(
        map(val => val ? 1 : -1 ),
        scan((acc, one) => (acc + one) >= 0 ? acc + one : 0, 0)
      )
      .subscribe(
        (res) => {
          if(res === 1){
            if(!this.spinnerTopRef.hasAttached()) {
              this.showSpinner();
            }
          }
          else if( res == 0 ){
            this.spinnerTopRef.hasAttached() ? this.stopSpinner(): null;
          }
        }
      )
  }

  private cdkSpinnerCreate() {
    return this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'dark-backdrop',
      positionStrategy: this.overlay.position()
        .global()
        .centerHorizontally()
        .centerVertically()
    })
  }

  private showSpinner(){
    //console.log("attach");
    this.spinnerTopRef.attach(new ComponentPortal(MatSpinner));
  }

  private stopSpinner(){
    //console.log("dispose");
    this.spinnerTopRef.detach() ;
  }
}
