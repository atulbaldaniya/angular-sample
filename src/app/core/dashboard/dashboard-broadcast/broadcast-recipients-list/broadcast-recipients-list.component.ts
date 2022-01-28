import { TranslateService } from '@ngx-translate/core';
import { SnackBarService } from '@app/core/core-app-services/helper/snack-bar.service';
import { StyResponse } from './../../../../interfaces/StyResponse';
import { MatDialog } from '@angular/material/dialog';
import { BroadcastConfirmationDialogComponent } from '@app/dialog/broadcast-confirmation-dialog/broadcast-confirmation-dialog.component';
import { SelectionModel } from '@angular/cdk/collections';
import { take, takeUntil } from 'rxjs/operators';
import { DrawerService } from './../../../core/core-app-services/side-nav/drawer.service';
import { MediaObserver } from '@angular/flex-layout';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDatepickerInputEvent, MatPaginator, MatSort, MatTableDataSource, MAT_DATE_FORMATS } from '@angular/material';
import { Component, ElementRef, EventEmitter, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { BroadcastService } from '@app/core/core-app-services/broadcast/broadcast.service';
import { WorkDataService } from '@app/core/core-app-services/work-data/work-data.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { StyleService } from '@app/core/core-app-services/helper/style.service';
import * as moment from 'moment-timezone';
import { ExpandEventArgs } from '@syncfusion/ej2-angular-navigations';
import { closest } from '@syncfusion/ej2-base';
moment().tz('Europe/Berlin');
moment.locale('de');

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD.MM.YY',
  },
  display: {
    dateInput: 'DD.MM.YY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  },
};

export interface BroadcastElement {
  _id: string;
  name: string;
  style: string;
  artist: string[];
  deposit: string;
}
@Component({
  selector: 'app-broadcast-recipients-list',
  templateUrl: './broadcast-recipients-list.component.html',
  styleUrls: ['./broadcast-recipients-list.component.scss'],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ]
})
export class BroadcastRecipientsListComponent implements OnInit {
  loading = false;
  private _destroyed = new Subject<void>();

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  displayed_columns: string[] = ['select', 'name', 'style', 'artist', 'deposit'];
  data_source: MatTableDataSource<{ _id: string; name: string; style: string; artist: string[]; deposit: string }>;
  table_columns: { column_def: string; text_translate: string }[] = [
    { column_def: 'select', text_translate: 'lang_broadcast_recipient_name' },
    { column_def: 'name', text_translate: 'lang_broadcast_recipient_name' },
    { column_def: 'style', text_translate: 'lang_broadcast_recipient_style' },
    { column_def: 'artist', text_translate: 'lang_broadcast_recipient_artist' },
    { column_def: 'deposit', text_translate: 'lang_broadcast_recipient_deposit' }
  ];
  artists: any[] = [];
  styles: any[] = [];
  chips: any[] = [];
  deposits = ['Pending', 'Received'];

  format = 'DD.MM.YY';

  ranges = [
    { key: 'between', value: this.translate.instant('lang_automation_between') },
    { key: 'after', value: this.translate.instant('lang_automation_before') },
    { key: 'before', value: this.translate.instant('lang_automation_after') }
  ];

  statuses = [
    { key: 'active', value: this.translate.instant('lang_session_status.active') },
    { key: 'accepted', value: this.translate.instant('lang_session_status.confirmed') },
    { key: 'confirmed', value: this.translate.instant('lang_session_status.confirmed') },
    { key: 'pending', value: this.translate.instant('lang_session_status.pending') },
    { key: 'onhold', value: this.translate.instant('lang_session_status.onhold') },
    { key: 'completed', value: this.translate.instant('lang_session_status.completed') },
    { key: 'canceled', value: this.translate.instant('lang_session_status.canceled') },
    { key: 'rejected', value: this.translate.instant('lang_session_status.rejected') },
    { key: 'archived', value: this.translate.instant('lang_session_status.archived') },
    { key: 'no_show', value: this.translate.instant('lang_session_status.no_show') }
  ];

  filterForm: FormGroup;
  initialSelection: any[] = [];
  allowMultiSelect: boolean = true;
  selection = new SelectionModel<BroadcastElement>(true, []);
  panelOpenState = false;
  tooltip = false;
  showSaveFilterOption = false;
  showSaveFilterForm = false;
  savefilterForm: FormGroup;
  savedFilterList: [] = [];

  @Output()
  dateChange: EventEmitter<MatDatepickerInputEvent<any>> = new EventEmitter();
  showAllActiveFilter = false;
  isExpandedCreated = false;
  isExpandedSession = false;
  isExpandedStatus = false;
  @ViewChild('wrapperSession', { read: ElementRef, static: false }) wrapperSession: ElementRef;

  @ViewChild('timeRangePicker', { static: true })
  public floatLabelType: 'Auto' | 'Never' | 'Always' = 'Auto';
  public time_range_end$: BehaviorSubject<Date> = new BehaviorSubject(null);
  public time_range_start$: BehaviorSubject<Date> = new BehaviorSubject(null);
  clickEventArgs: any;
  constructor(
    private broadcast: BroadcastService,
    private router: Router,
    public media: MediaObserver,
    public drawer_service: DrawerService,
    public workdata: WorkDataService,
    private fb: FormBuilder,
    public style: StyleService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private snackbarService: SnackBarService,
    public translate: TranslateService
  ) {

    this.translate.onLangChange.pipe(takeUntil(this._destroyed)).subscribe(change => {
      this.ranges = [
        { key: 'between', value: this.translate.instant('lang_automation_between') },
        { key: 'after', value: this.translate.instant('lang_automation_before') },
        { key: 'before', value: this.translate.instant('lang_automation_after') }
      ];

      this.statuses = [
        { key: 'active', value: this.translate.instant('lang_session_status.active') },
        { key: 'accepted', value: this.translate.instant('lang_session_status.confirmed') },
        { key: 'confirmed', value: this.translate.instant('lang_session_status.confirmed') },
        { key: 'pending', value: this.translate.instant('lang_session_status.pending') },
        { key: 'onhold', value: this.translate.instant('lang_session_status.onhold') },
        { key: 'completed', value: this.translate.instant('lang_session_status.completed') },
        { key: 'canceled', value: this.translate.instant('lang_session_status.canceled') },
        { key: 'rejected', value: this.translate.instant('lang_session_status.rejected') },
        { key: 'archived', value: this.translate.instant('lang_session_status.archived') },
        { key: 'no_show', value: this.translate.instant('lang_session_status.no_show') }
      ];

      this.filterList();
    });

  }

  get time_range_start(): Date {
    return this.time_range_start$.value;
  }
  set time_range_start(date: Date) {
    this.time_range_start$.next(date);
  }

  get time_range_end(): Date {
    return this.time_range_end$.value;
  }
  set time_range_end(date: Date) {
    this.time_range_end$.next(date);
  }

  public expanding(e: ExpandEventArgs) {
    if (this.clickEventArgs) {
      let header = closest(
        this.clickEventArgs.target as HTMLElement,
        ".e-acrdn-header"
      );
      let checkboxEle = closest(
        this.clickEventArgs.target as HTMLElement,
        ".e-checkbox-wrapper"
      );
      if (header && !checkboxEle) {
        e.cancel = true;
        return;
      }
    }
  }
  public onClick(e: any) {
    this.clickEventArgs = e.originalEvent;
  }
  public changeHandler() {
    this.clickEventArgs = null;
  }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      artist: ['', null],
      style: ['', null],
      deposit: ['', null],
      savedFilter: ['', null],
      session: [null, null],
      session_range: [null, null],
      session_range_date: [null, null],
      session_start: ['', null],
      session_end: ['', null],
      created_range: [null, null],
      created_range_date: [null, null],
      created_start: ['', null],
      created_end: ['', null],
      status: [null, null]
    });

    this.savefilterForm = this.fb.group({
      name: ['', Validators.required]
    });

    this.getFilter();
    this.getRecipients({ artists_ids: [] });
    this.workdata.getWorkDataForLoggedInUser().then((response: any) => {
      if (response.workDatas) {
        this.artists = response.workDatas.map((workdata: any) => {
          let artist = workdata.artist;
          let name =
            artist.aId && artist.aId.aliasName
              ? artist.aId.aliasName
              : artist && artist.aId.firstName
              ? [artist.aId.firstName, artist.aId.lastName].join(' ')
              : null;
          return {
            _id: workdata.artist.aId._id,
            artistName: name
          };
        });
      }
    });
    this.styles = this.style.getStylesList();
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  /**
   * select all recipients
   */
  isAllSelected() {
    let numSelected;
    if (this.selection && this.selection.selected) {
      numSelected = this.selection.selected.length;
    }
    let numRows;
    if (this.data_source && this.data_source.data) {
      numRows = this.data_source.data.length;
    }
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.data_source.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: BroadcastElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.name + 1}`;
  }

  /** get recipients list as per filer data
   * @param  {object} data
   */
  getRecipients(formData: object) {
    let data = JSON.parse(JSON.stringify(formData));
    data = this.convertDateFormat(data);

    this.loading = true;
    this.broadcast
      .getRecipients(data)
      .pipe(takeUntil(this._destroyed))
      .subscribe((response: StyResponse) => {
        this.loading = false;
        const data = response.result;
        if (!data.length) {
          this.data_source.data = data;
          this.data_source.paginator = this.paginator;
          this.data_source.sort = this.sort;
          return;
        }
        if (data && data.length) {
          if (!this.data_source) {
            this.data_source = new MatTableDataSource<{
              _id: string;
              name: string;
              style: string;
              artist: string[];
              deposit: string;
            }>();
            this.data_source.paginator = this.paginator;
            this.data_source.sort = this.sort;
          }
          this.data_source.data = data;
        }
      });
  }

  ngAfterViewInit(): void {
    /** subscribe to sort changes */
    this.sort.sortChange
      .pipe(takeUntil(this._destroyed))
      .subscribe((sortChange: { active: string; direction: string }) => {
        /** after changing sort go back to first page */
        this.paginator.pageIndex = 0;
      });
  }

  convertDateFormat(data: any){
    if(!!data && !!data.session && !!data.session.created_date.start_date){
      let x = moment(data.session.created_date.start_date, this.format).valueOf();
      data.session.created_date.start_date = moment.tz(x, 'Europe/Berlin').format("YYYY-MM-DD");
    }
    if(!!data && !!data.session && !!data.session.created_date.end_date){
      let x = moment(data.session.created_date.end_date, this.format).valueOf();
      data.session.created_date.end_date = moment.tz(x, 'Europe/Berlin').format("YYYY-MM-DD");
    }
    if(!!data && !!data.session && !!data.session.session_date.start_date){
      let x = moment(data.session.session_date.start_date, this.format).valueOf();
      data.session.session_date.start_date = moment.tz(x, 'Europe/Berlin').format("YYYY-MM-DD");
    }
    if(!!data && !!data.session && !!data.session.session_date.end_date){
      let x = moment(data.session.session_date.end_date, this.format).valueOf();
      data.session.session_date.end_date = moment.tz(x, 'Europe/Berlin').format("YYYY-MM-DD");
    }
    return data;
  }

  /**
   * send broadcast to clients
   */
  sendBroadcast() {
    let client = [];
    client = this.selection.selected.map((client: any) => {
      return client._id;
    });
    if (!client.length) {
      return;
    }
    let filterData = {
      broadcast_id: this.route.snapshot.params.id,
      client_id: client
    };

    const dialogRef = this.dialog.open(BroadcastConfirmationDialogComponent, {
      data: filterData
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this._destroyed))
      .subscribe(result => {
        if (result) {
          // go to history page
        }
      });
  }

  get stylesSelect(): FormControl {
    return this.filterForm.get('style') as FormControl;
  }

  get artistSelect(): FormControl {
    return this.filterForm.get('artist') as FormControl;
  }

  showTooltip() {
    // this.tooltip = true;
    this.tooltip = !this.tooltip;
  }

  clickedOutside(event: any) {
    if (event && event.target && event.target.className) {
      if(
        this.wrapperSession.nativeElement.innerHTML.indexOf(event.target.className) != -1 ||
        event.target.className.indexOf('mat-option-text') != -1 ||
        event.target.className.indexOf('mat-pseudo-checkbox') != -1 ||
        event.target.className.indexOf('mat-option-multiple') != -1 ||
        event.target.className.indexOf('e-day') != -1 ||
        event.target.className.indexOf('e-ripple') != -1 ||
        event.target.className.indexOf('e-icons') != -1 ||
        event.target.className.indexOf('e-end-label') != -1 ||
        event.target.className.indexOf('e-start-label') != -1 ||
        event.target.className.indexOf('e-day-span') != -1 ||
        event.target.className.indexOf('e-header') != -1 ||
        event.target.className.indexOf('e-cell') != -1 ||
        event.target.className.indexOf('mat-icon-button') != -1 ||
        event.target.className.indexOf('mat-calendar-body-cell') != -1 ||
        event.target.className.indexOf('mat-calendar-body-cell-content') != -1 ||
        event.target.className.indexOf('mat-calendar-arrow') != -1 ||
        event.target.className.indexOf('mat-button') != -1 ||
        event.target.className.indexOf('cdk-overlay-backdrop') != -1 ||
        event.target.className.indexOf('wrapperClient') != -1
        ){
        this.tooltip = true;
      }else {
        console.log('event.target.className',event.target.className);
        this.tooltip = false;
      }
    }
  }

  /**
   * display first artist and count of remaining artists
   * @param  {any} row
   */
  displayArtistRow(row: any) {
    let artists = [];
    if (row.projects.length > 0) {
      artists = row.projects.map((obj: any) => {
        if (!!obj.assigned_artist) {
          let name = obj.assigned_artist.firstName + ' ' + obj.assigned_artist.lastName;
          return name;
        }
      });
      artists = artists.filter((item: string) => item);

      if (artists.length > 1) {
        return artists[0] + ' and ' + (artists.length - 1) + ' more';
      } else {
        return artists.join(', ');
      }
    }
  }

  /**
   * display all artist name in tooltip
   * @param  {any} row
   */
  displayArtistTooltip(row: any) {
    let artists = [];
    if (row.projects.length > 0) {
      artists = row.projects.map((obj: any) => {
        if (!!obj.assigned_artist) {
          let name = obj.assigned_artist.firstName + ' ' + obj.assigned_artist.lastName;
          return name;
        }
      });
    }
    artists = artists.filter((item: string) => item);
    return artists.join(', ');
  }

  /**
   * display first style and count of remaining styles
   * @param  {any} row
   */
  displayStyleRow(row: any) {
    let styles = [];
    if (row.projects.length > 0) {
      styles = row.projects.map((value: any) => {
        return value.styles;
      });
    }

    styles = styles.filter((item: string) => item);
    styles = styles.filter(function(el: string) {
      if (el.length) {
        return el != null;
      }
    });
    if (styles.length > 1) {
      return styles[0] + ' and ' + (styles.length - 1) + ' more';
    } else {
      return styles.join(', ');
    }
  }

  /**
   * display all styles in tooltip
   * @param  {any} row
   */
  displayStyleTooltip(row: any) {
    let styles = [];
    if (row.projects.length > 0) {
      styles = row.projects.map((value: any) => {
        return value.styles;
      });
    }

    styles = styles.filter((item: string) => item);
    styles = styles.filter(function(el: string) {
      if (el.length) {
        return el != null;
      }
    });
    return styles.join(', ');
  }

  /**
   * display first deposit option and count of remaining
   * @param  {any} row
   */
  displayDepositRow(row: any) {
    let deposits = [];
    if (row.projects.length > 0) {
      deposits = row.projects.map((value: any) => {
        if (value.deposits.length === 0) {
          return '';
        } else {
          return value.deposits[0];
        }
      });
    }

    deposits = deposits.filter((item: string) => item);
    deposits = deposits.filter(function(el: string) {
      if (el.length) {
        return el != null;
      }
    });
    if (deposits.length > 1) {
      return deposits[0] + ' and ' + (deposits.length - 1) + ' more';
    } else {
      return deposits.join(', ');
    }
  }

  /**
   * display all deposit in tooltip
   * @param  {any} row
   */
  displayDepositTooltip(row: any) {
    let deposits = [];
    if (row.projects.length > 0) {
      deposits = row.projects.map((value: any) => {
        if (value.deposits.length === 0) {
          return '';
        } else {
          return value.deposits[0];
        }
      });
    }
    deposits = deposits.filter((item: string) => item);
    deposits = deposits.filter(function(el: string) {
      if (el.length) {
        return el != null;
      }
    });
    return deposits.join(', ');
  }

  /**
   *  based on filter get recipients list and also show active chips
   */
  filterList() {
    let artists = this.filterForm.value.artist;
    let styles = this.filterForm.value.style;
    let deposits = this.filterForm.value.deposit;

    let session_range = this.filterForm.value.session_range;
    let session_start = moment.tz(this.filterForm.value.session_start, 'Europe/Berlin').format(this.format);
    session_start = session_start === 'Invalid date' ? '' : session_start;
    let session_end = moment.tz(this.filterForm.value.session_end, 'Europe/Berlin').format(this.format);
    session_end = session_end === 'Invalid date' ? '' : session_end;

    let created_range = this.filterForm.value.created_range;
    let created_start = moment.tz(this.filterForm.value.created_start, 'Europe/Berlin').format(this.format);
    created_start = created_start === 'Invalid date' ? '' : created_start;
    let created_end = moment.tz(this.filterForm.value.created_end, 'Europe/Berlin').format(this.format);
    created_end = created_end === 'Invalid date' ? '' : created_end;
    let sessionStatus =
      this.filterForm.value.status && this.filterForm.value.status.length > 0 ? this.filterForm.value.status : null;

    let filter = {
      artists_ids: this.filterForm.value.artist,
      styles: this.filterForm.value.style,
      deposit: this.filterForm.value.deposit,
      session: {
        status: sessionStatus,
        session_date: { start_date: session_start, end_date: session_end, type: session_range },
        created_date: { start_date: created_start, end_date: created_end, type: created_range }
      }
    };
    this.getRecipients(filter);

    if (!!artists && artists.length > 0) {
      this.showSaveFilterOption = true;
    } else if (!!styles && styles.length > 0) {
      this.showSaveFilterOption = true;
    } else if (!!deposits && deposits.length > 0) {
      this.showSaveFilterOption = true;
    } else {
      this.showSaveFilterOption = false;
    }

    this.chips = [];
    if (!!artists && artists.length) {
      artists.map((item: string) => {
        this.chips.push({
          type: 'artist',
          displayName: this.displayArtistName(item),
          _id: item
        });
      });
    }

    if (!!styles && styles.length) {
      styles.map((item: string) => {
        this.chips.push({
          displayName: item,
          type: 'style'
        });
      });
    }

    if (!!deposits && deposits.length) {
      deposits.map((item: string) => {
        this.chips.push({
          displayName: item,
          type: 'deposit'
        });
      });
    }

    let session = this.translate.instant('lang_broadcast_session');
    if (!!session_start && !!session_end && !!session_range) {
      let sessionTxt = this.ranges.find(range => range.key === session_range);
      this.chips.push({
        displayName: session + ' ' + sessionTxt.value + ' : ' + session_start + ' to ' + session_end,
        type: 'session_1'
      });
    } else if (!!session_start && !!session_range) {
      let sessionTxt = this.ranges.find(range => range.key === session_range);
      this.chips.push({
        displayName: session + ' ' + sessionTxt.value + ' : ' + session_start,
        type: 'session_2'
      });
    }

    let created = this.translate.instant('lang_broadcast_created');
    if (!!created_start && !!created_end && !!created_range) {
      let createdTxt = this.ranges.find(range => range.key === created_range);
      this.chips.push({
        displayName: created + ' ' + createdTxt.value + ' : ' + created_start + ' to ' + created_end,
        type: 'created_1'
      });
    } else if (!!created_start && !!created_range) {
      let createdTxt = this.ranges.find(range => range.key === created_range);
      this.chips.push({
        displayName: created + ' ' + createdTxt.value + ' : ' + created_start,
        type: 'created_2'
      });
    }

    if (!!sessionStatus && sessionStatus.length) {
      sessionStatus.map((item: string) => {
        this.chips.push({
          displayName: this.getStatusValue(item),
          _id: item,
          type: 'status'
        });
      });
    }
    this.chips.reverse();
    console.log('this.chips', this.chips);
  }

  getStatusValue(item: string) {
    let tmp = '';
    this.statuses.forEach((k, v) => {
      if (k.key === item) {
        tmp = k.value;
      }
    });
    return tmp;
  }

  /**
   * get save filter list
   */
  getFilter() {
    this.broadcast
      .getFilter()
      .pipe(takeUntil(this._destroyed))
      .subscribe((response: StyResponse) => {
        if (response.result) {
          this.savedFilterList = response.result;
        }
      });
  }

  /**
   * save filter
   */
  saveFilter() {
    let filterName = this.savefilterForm.value.name;
    let checkFilterAlreadyExist = this.savedFilterList.find(
      (filterName_: any) => filterName_.name.toLowerCase() === filterName.toLowerCase()
    );

    if (checkFilterAlreadyExist) {
      this.snackbarService.openSnackBar(this.translate.instant('lang_broadcast_already_exist_filter'), '', 5000);
      return;
    }
    let data = {
      name: filterName,
      filter_data: this.filterForm.value
    };
    this.broadcast
      .saveFilter(data)
      .pipe(take(1))
      .subscribe(
        response => {
          this.showSaveFilterForm = false;
          this.showSaveFilterOption = false;
          this.getFilter();
          this.savefilterForm.reset();
          this.snackbarService.openSnackBar(this.translate.instant('lang_broadcast_save_filter_success'), '', 5000);
        },
        (err: any) => {
          this.snackbarService.openSnackBar(this.translate.instant('lang_broadcast_save_filter_error'), '', 5000);
        }
      );
  }

  /**
   * get save filter data and apply in list to get filtered recipients list
   */
  getSaveFilterData() {
    setTimeout(() => {
      if (this.filterForm.value.savedFilter) {
        let filterData = this.filterForm.value.savedFilter.filter_data;
        this.filterForm = this.fb.group({
          artist: [filterData.artist, null],
          style: [filterData.style, null],
          deposit: [filterData.deposit, null],
          savedFilter: [this.filterForm.value.savedFilter, null],
          session: [filterData.session, null],
          session_range: [filterData.session_range, null],
          session_start: [filterData.session_start, null],
          session_end: [filterData.session_end, null],
          created_range: [filterData.created_range, null],
          created_start: [filterData.created_start, null],
          created_end: [filterData.created_end, null],
          status: [filterData.status, null]
        });
      } else {
        this.chips = [];
        this.filterForm.reset();
        this.showSaveFilterOption = false;
      }
      this.selection.clear();
      this.filterList();
    }, 100);
  }

  /**
   * on date change in automation filter check that change to applicable for filter or not if yes then apply filter to recipients list
   * @returns void
   */
  onDateChange(): void {
    setTimeout(() => {
      if (this.filterForm.value.session_range !== 'between') {
        this.filterForm.value.session_range_date = null;
      }
      if (this.filterForm.value.session_range_date) {
        this.filterForm.value.session_start = this.filterForm.value.session_range_date[0];
        this.filterForm.value.session_end = this.filterForm.value.session_range_date[1];
      }

      if (this.filterForm.value.created_range !== 'between') {
        this.filterForm.value.created_range_date = null;
      }
      if (this.filterForm.value.created_range_date) {
        this.filterForm.value.created_start = this.filterForm.value.created_range_date[0];
        this.filterForm.value.created_end = this.filterForm.value.created_range_date[1];
      }

      if (
        !!this.filterForm.value.session_start &&
        !!this.filterForm.value.session_end &&
        !!this.filterForm.value.session_range
      ) {
        this.filterList();
        return;
      } else if (!!this.filterForm.value.session_start && !!this.filterForm.value.session_range) {
        this.filterList();
        return;
      }

      if (
        !!this.filterForm.value.created_start &&
        !!this.filterForm.value.created_end &&
        !!this.filterForm.value.created_range
      ) {
        this.filterList();
        return;
      } else if (!!this.filterForm.value.created_start && !!this.filterForm.value.created_range) {
        this.filterList();
        return;
      }
    }, 100);
  }

  /**
   * go back to edit page of broadcast
   */
  goBack() {
    this.router.navigate(['/dashboard/broadcasts/bearbeiten/' + this.route.snapshot.params.id]);
  }

  /**
   * Get name of artist by id
   * @param  {string} id
   */
  displayArtistName(id: string) {
    let tmp = this.artists.map(value => {
      if (value._id === id) {
        return value.artistName;
      }
    });
    return tmp.filter((item: string) => item);
  }

  /**
   * remove active chip as per type
   * @param  {{type:string;_id:string;displayName:string}} chip
   */
  removeChip(chip: { type: string; _id: string; displayName: string }) {
    if (chip.type === 'style') {
      this.filterForm.value.style = this.filterForm.value.style.filter((stl: string) => stl !== chip.displayName);
    } else if (chip.type === 'deposit') {
      this.filterForm.value.deposit = this.filterForm.value.deposit.filter((stl: string) => stl !== chip.displayName);
    } else if (chip.type === 'artist') {
      this.filterForm.value.artist = this.filterForm.value.artist.filter((stl: string) => stl !== chip._id);
    } else if (chip.type === 'session_1' || chip.type === 'session_2') {
      this.filterForm.value.session_start = null;
      this.filterForm.value.session_end = null;
      this.filterForm.value.session_range = null;
    } else if (chip.type === 'created_1' || chip.type === 'created_2') {
      this.filterForm.value.created_start = null;
      this.filterForm.value.created_end = null;
      this.filterForm.value.created_range = null;
    } else if (chip.type === 'status') {
      this.filterForm.value.status = this.filterForm.value.status.filter((stl: string) => stl !== chip._id);
    }

    this.filterForm = this.fb.group({
      artist: [this.filterForm.value.artist, null],
      style: [this.filterForm.value.style, null],
      deposit: [this.filterForm.value.deposit, null],
      savedFilter: [this.filterForm.value.savedFilter, null],
      session: [this.filterForm.value.session, null],
      session_range: [this.filterForm.value.session_range, null],
      session_start: [this.filterForm.value.session_start, null],
      session_end: [this.filterForm.value.session_end, null],
      created_range: [this.filterForm.value.created_range, null],
      created_start: [this.filterForm.value.created_start, null],
      created_end: [this.filterForm.value.created_end, null],
      status: [this.filterForm.value.status, null]
    });

    this.filterList();
  }

  /**
   * close session panel
   */
  closePanel() {
    this.tooltip = false;
  }
}
