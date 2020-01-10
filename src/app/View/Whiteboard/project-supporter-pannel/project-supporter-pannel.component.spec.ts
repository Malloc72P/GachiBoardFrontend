import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectSupporterPannelComponent } from './project-supporter-pannel.component';

describe('ProjectSupporterPannelComponent', () => {
  let component: ProjectSupporterPannelComponent;
  let fixture: ComponentFixture<ProjectSupporterPannelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectSupporterPannelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectSupporterPannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
