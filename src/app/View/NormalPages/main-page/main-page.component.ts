import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AuthRequestService} from '../../../Controller/SocialLogin/auth-request/auth-request.service';
import {RouterHelperService} from '../../../Model/Helper/router-helper-service/router-helper.service';
import {MediaMatcher} from '@angular/cdk/layout';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css', './../gachi-font.css']
})
export class MainPageComponent implements OnInit, OnDestroy {
  @ViewChild('mainLeftDrawer', {static: true}) mainLeftDrawer;

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  constructor(
    private authRequestService:AuthRequestService,
    private routerHelperService:RouterHelperService,
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  ngOnInit() {
    this.authRequestService.protectedApi().subscribe(()=>{
      this.mainLeftDrawer.toggle();
    });
  }

  private onSignoutClick(){
    this.authRequestService.signOut();
  }
  private onLogoClick(){
    this.routerHelperService.goToHomePage();
  }

}
