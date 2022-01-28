import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BroadcastFormComponent } from './broadcast-form.component';

describe('BroadcastFormComponent', () => {
  let component: BroadcastFormComponent;
  let fixture: ComponentFixture<BroadcastFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BroadcastFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BroadcastFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
