import { TranslateService } from '@ngx-translate/core';
import { SnackBarService } from './../../../core/core-app-services/helper/snack-bar.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Component, OnInit, Input } from '@angular/core';
import { BroadcastService } from '@app/core/core-app-services/broadcast/broadcast.service';
import { GroupSettingsModel } from '@syncfusion/ej2-angular-grids';
@Component({
  selector: 'app-broadcast-history',
  templateUrl: './broadcast-history.component.html',
  styleUrls: ['./broadcast-history.component.scss']
})
export class BroadcastHistoryComponent implements OnInit {
  @Input() broadcast_id: string;
  loading = false;
  stopLoader = false;

  private _destroyed = new Subject<void>();

  constructor(
    private snackbarService: SnackBarService,
    public translate: TranslateService,
    private broadcast: BroadcastService
  ) {}

  public data: Object[] = [];
  public groupOptions: GroupSettingsModel;
  public formatOptions: object;

  ngOnInit(): void {
    this.getBroadcastHistoryData(this.broadcast_id);
    this.groupOptions = { showDropArea: false, columns: ['send_date'] };
    this.formatOptions = { type: 'date', format: 'yyyy/MM/dd' };
  }

  /**
   * get broadcast history by broadcast id
   * @param  {string} broadcast_id
   */
  getBroadcastHistoryData(broadcast_id: string) {
    this.loading = true;
    this.broadcast
      .getBroadcastHistoryData(broadcast_id)
      .pipe(takeUntil(this._destroyed))
      .subscribe(
        (response: any) => {
          this.loading = false;
          this.data = [];
          response.forEach((recipient: any) => {
            recipient.send_date = new Date(recipient.send_date);
            this.data.push(recipient);
          });
          setTimeout(() => {
            // @ts-ignore
            document.getElementsByClassName('e-content')[0].style.height = '100%';
          }, 500);
        },
        (err: any) => {
          this.stopLoader = true;
          this.snackbarService.openSnackBar(this.translate.instant('lang_broadcast_history_empty'), '', 5000);
        }
      );
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }
}
