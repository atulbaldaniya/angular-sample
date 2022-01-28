import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BroadcastRecipientsListComponent } from './broadcast-recipients-list.component';

describe('BroadcastRecipientsListComponent', () => {
  let component: BroadcastRecipientsListComponent;
  let fixture: ComponentFixture<BroadcastRecipientsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BroadcastRecipientsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BroadcastRecipientsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
