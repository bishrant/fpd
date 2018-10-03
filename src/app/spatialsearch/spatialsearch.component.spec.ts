import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpatialsearchComponent } from './spatialsearch.component';

describe('SpatialsearchComponent', () => {
  let component: SpatialsearchComponent;
  let fixture: ComponentFixture<SpatialsearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpatialsearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpatialsearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
