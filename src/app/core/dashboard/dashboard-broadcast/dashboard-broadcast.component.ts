import { Component, OnInit } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { StyngAuthService } from '@app/core/core-app-services/user-management/styng-auth.service';
import { DrawerService } from '@app/core/core-app-services/side-nav/drawer.service';
import { UserService } from '@app/core/core-app-services/user-management/user.service';
import { TranslateService } from '@ngx-translate/core';
import { BroadcastService } from '@app/core/core-app-services/broadcast/broadcast.service';

@Component({
  selector: 'app-dashboard-broadcast',
  templateUrl: './dashboard-broadcast.component.html',
  styleUrls: ['./dashboard-broadcast.component.scss']
})
export class DashboardBroadcastComponent implements OnInit {
  public active_pane = 'left';
  public pause_slider = false;
  public hasBroadcast = false;

  public animations = {
    calendar: '../../../assets/animations/confirmed-date.json',
    messenger: '../../../assets/animations/conversation.json',
    recover: '../../../assets/animations/trash-can.json',
    security: '../../../assets/animations/insurance.json'
  };

  constructor(
    public media: MediaObserver,
    public styngAuthService: StyngAuthService,
    public drawerService: DrawerService,
    public userService: UserService,
    public translate: TranslateService,
    public broadcast: BroadcastService,
    ) {}

  ngOnInit(): void {

  }

  /**
   * pause slider
   */
  pauseSlider() {
    this.pause_slider = true;
  }

  /**
   * play slide show
   */
  continueSlider() {
    this.pause_slider = false;
  }
}
