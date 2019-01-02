import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddupdatepageComponent } from './addupdatepage.component';

describe('AddupdatepageComponent', () => {
  let component: AddupdatepageComponent;
  let fixture: ComponentFixture<AddupdatepageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddupdatepageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddupdatepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
