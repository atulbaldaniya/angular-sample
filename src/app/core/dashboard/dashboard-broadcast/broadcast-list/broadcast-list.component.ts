import { StyResponse } from './../../../../interfaces/StyResponse';
import { MatDialog } from '@angular/material/dialog';
import { DrawerService } from './../../../core/core-app-services/side-nav/drawer.service';
import { MediaObserver } from '@angular/flex-layout';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { BroadcastService } from '@app/core/core-app-services/broadcast/broadcast.service';
import { take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { BroadcastDeleteConfirmationDialogComponent } from '@app/dialog/broadcast-delete-confirmation-dialog/broadcast-delete-confirmation-dialog.component';

@Component({
  selector: 'app-broadcast-list',
  templateUrl: './broadcast-list.component.html',
  styleUrls: ['./broadcast-list.component.scss']
})
export class BroadcastListComponent implements OnInit {
  loading = false;
  private _destroyed = new Subject<void>();

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  displayed_columns: string[] = ['name', 'subject', 'last_send_date', 'action'];
  data_source: MatTableDataSource<{
    _id: string;
    name: string;
    subject: string;
    last_send_date: string[];
    action: string;
  }>;
  table_columns: { column_def: string; text_translate: string }[] = [
    { column_def: 'name', text_translate: 'lang_broadcast_name' },
    { column_def: 'subject', text_translate: 'lang_broadcast_subject' },
    { column_def: 'last_send_date', text_translate: 'lang_broadcast_last_sent_date' },
    { column_def: 'action', text_translate: 'lang_actions' }
  ];

  constructor(
    private broadcast: BroadcastService,
    private router: Router,
    public media: MediaObserver,
    public drawer_service: DrawerService,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.getBroadcastList();
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  /**
   * get broadcast data
   */
  getBroadcastList() {
    this.broadcast
      .getList()
      .pipe(takeUntil(this._destroyed))
      .subscribe((response: StyResponse) => {
        if (response.result.length > 0) {
          const data = response.result;
          if (!data) {
            return;
          }
          if (data && data.length) {
            if (!this.data_source) {
              this.data_source = new MatTableDataSource<{
                _id: string;
                name: string;
                subject: string;
                last_send_date: string[];
                action: string;
              }>();
              this.data_source.paginator = this.paginator;
              this.data_source.sort = this.sort;
            }
            this.data_source.data = data;
          }
        } else {
          this.router.navigate(['/dashboard/broadcasts/erstellen']);
        }
      });
  }

  /**
   * edit broadcast by id when user click on row
   * @param  {{_id:string;}} data
   */
  cellClicked(data: { _id: string }) {
    if (data && data._id) {
      this.router.navigate(['/dashboard/broadcasts/bearbeiten/', data._id]);
    }
  }

  ngAfterViewInit(): void {
    this.sort.sortChange
      .pipe(takeUntil(this._destroyed))
      .subscribe((sortChange: { active: string; direction: string }) => {
        this.paginator.pageIndex = 0;
      });
  }

  /**
   * edit broadcast by id by pressing pencil icon
   * @param  {{_id:string;}} data
   */
  edit(data: any) {
    this.router.navigate(['/dashboard/broadcasts/bearbeiten/', data._id]);
  }

  /**
   * delete broadcast by id by pressing trash icon
   * @param  {{_id:string;}} data
   */
  delete(data: {_id: string}) {
    const dialogRef = this.dialog.open(BroadcastDeleteConfirmationDialogComponent);
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this._destroyed))
      .subscribe(result => {
        if (result) {
          this.broadcast
            .delete(data._id)
            .pipe(take(1))
            .subscribe(response => {
              setTimeout(() => {
                this.getBroadcastList();
              }, 1000);
            });
        }
      });
  }
}
