import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardBroadcastComponent } from './dashboard-broadcast.component';

describe('DashboardBroadcastComponent', () => {
  let component: DashboardBroadcastComponent;
  let fixture: ComponentFixture<DashboardBroadcastComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardBroadcastComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardBroadcastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
