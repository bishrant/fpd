import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturetableComponent } from './featuretable.component';

describe('FeaturetableComponent', () => {
  let component: FeaturetableComponent;
  let fixture: ComponentFixture<FeaturetableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeaturetableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeaturetableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
