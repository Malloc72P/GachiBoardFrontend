import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhiteboardBannerComponent } from './whiteboard-banner.component';

describe('WhiteboardBannerComponent', () => {
  let component: WhiteboardBannerComponent;
  let fixture: ComponentFixture<WhiteboardBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhiteboardBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhiteboardBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
