import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BroadcastHistoryComponent } from './broadcast-history.component';

describe('BroadcastHistoryComponent', () => {
  let component: BroadcastHistoryComponent;
  let fixture: ComponentFixture<BroadcastHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BroadcastHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BroadcastHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
