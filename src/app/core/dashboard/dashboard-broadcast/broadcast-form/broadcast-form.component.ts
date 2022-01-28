import { StyResponse } from './../../../../interfaces/StyResponse';
import { SnackBarService } from './../../../core/core-app-services/helper/snack-bar.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { StyngAuthService } from '@app/core/core-app-services/user-management/styng-auth.service';
import { DrawerService } from '@app/core/core-app-services/side-nav/drawer.service';
import { UserService } from '@app/core/core-app-services/user-management/user.service';
import { TranslateService } from '@ngx-translate/core';
import { HttpEventType } from '@angular/common/http';
import { finalize, takeUntil, take } from 'rxjs/operators';
import { BroadcastService } from '@app/core/core-app-services/broadcast/broadcast.service';

@Component({
  selector: 'app-broadcast-form',
  templateUrl: './broadcast-form.component.html',
  styleUrls: ['./broadcast-form.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class BroadcastFormComponent implements OnInit {
  newBroadcastGroup: FormGroup;
  _id: string;
  isEdit: boolean = false;
  isHistory: boolean = false;
  files: Array<any> = [];
  recipient: Array<any> = [];
  attachment: Array<any> = [];
  file_ids: Array<any> = [];

  private _destroyed = new Subject<void>();

  constructor(
    public media: MediaObserver,
    public styngAuthService: StyngAuthService,
    public drawerService: DrawerService,
    public userService: UserService,
    public translate: TranslateService,
    private fb: FormBuilder,
    private broadcast: BroadcastService,
    private router: Router,
    private snackbarService: SnackBarService,
    private route: ActivatedRoute
  ) {
    this.translate.onLangChange.pipe(takeUntil(this._destroyed)).subscribe(change => {
      this.attachFile = this.translate.instant('lang_broadcast_attach_file');
    });
  }

  ngOnInit(): void {
    this.newBroadcastGroup = this.fb.group({
      name: ['', Validators.required],
      subject: ['', Validators.required],
      content: ['', Validators.required],
      attachment: [this.attachment]
    });
    this._id = this.route.snapshot.params.id;
    if (!!this._id && this.route.snapshot.routeConfig.path === 'historie/:id') {
      this.isEdit = true;
      this.isHistory = true;
    } else if (!!this._id) {
      this.isHistory = false;
      this.isEdit = true;
      this.getBroadcastById(this._id);
    }
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  /**
   * get broadcast details by id
   * @param  {string} _id
   */
  getBroadcastById(_id: string) {
    this.broadcast
      .getDetail(_id)
      .pipe(takeUntil(this._destroyed))
      .subscribe(
        (response: StyResponse) => {
          if (!response.result._id) {
            this.router.navigate(['/dashboard/broadcasts']);
          } else {
            this.newBroadcastGroup = this.fb.group({
              name: [response.result.name, Validators.required],
              subject: [response.result.subject, Validators.required],
              content: [response.result.content, Validators.required],
              attachment: [this.attachment]
            });
            for (let file of response.result.attachment) {
              if (file) {
                this.files.push({ filename: file.file_name, file_id: file._id, loading: false });
              }
            }
          }
        },
        (err: any) => {
          this.snackbarService.openSnackBar(this.translate.instant('lang_broadcast_not_found'), '', 5000);
        }
      );
  }

  /**
   * insert placeholder in text area at cursor place
   * @param  {string} myValue
   */
  insertAtCursor(myValue: string) {
    // @ts-ignore
    let curPos = document.getElementById('broadcast-content').selectionStart;
    // @ts-ignore
    let x = document.getElementById('broadcast-content').value;
    // @ts-ignore
    document.getElementById('broadcast-content').value = x.slice(0, curPos) + '{{' + myValue + '}}' + x.slice(curPos);
    let newPos = curPos + myValue.length + 4;
    // @ts-ignore
    document.getElementById('broadcast-content').selectionStart = newPos;
    // @ts-ignore
    document.getElementById('broadcast-content').selectionEnd = newPos;
  }

  /**
   * go back to broadcast list page
   */
  goBack() {
    this.router.navigate(['/dashboard/broadcasts']);
  }

  @Input()
  requiredFileType: string;

  fileName = '';
  uploadProgress: number;
  uploadSub: Subscription;

  attachFile = this.translate.instant('lang_broadcast_attach_file');

  /**
   * upload file on select
   * @param  {any} event
   */
  onFileSelected(event: any) {
    const files = event.target.files;
    if (this.files.length > 3 || files.length > 3 || this.files.length + files.length > 3) {
      this.snackbarService.openSnackBar(this.translate.instant('lang_broadcast_max_file_warning'), '', 5000);
      return;
    }

    for (let file of files) {
      let sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      if (parseFloat(sizeInMB) > 10) {
        this.snackbarService.openSnackBar(this.translate.instant('lang_broadcast_invalid_file_warning'), '', 5000);
        return;
      }
      if (file) {
        let checkType = ['image/jpeg', 'image/png', 'application/pdf'].filter(f => f === file.type);
        if (!checkType.length) {
          this.snackbarService.openSnackBar(this.translate.instant('lang_broadcast_invalid_file_warning'), '', 5000);
          return;
        }

        this.files.push({ filename: file.name, loading: true });
        let formData = new FormData();
        formData.append('files', file);
        formData.append('type', 'broadcast');
        const upload$ = this.broadcast.uploadFile(formData).pipe(finalize(() => this.reset()));

        this.uploadSub = upload$.subscribe(
          (event: any) => {
            if (event.result) {
              if (event.result.file_name) {
                this.attachment.push(event.result);
                let fileIndex = this.files.findIndex(file => file.filename == event.result.file_name);
                this.files[fileIndex].loading = false;
                this.files[fileIndex].file_key = event.result.file_key;
                this.snackbarService.openSnackBar(
                  this.translate.instant('lang_broadcast_uploaded_successfully'),
                  '',
                  5000
                );
              }
            }
            if (event.type == HttpEventType.UploadProgress) {
              this.uploadProgress = Math.round(100 * (event.loaded / event.total));
            }
          },
          (err: any) => {
            this.snackbarService.openSnackBar(this.translate.instant('lang_broadcast_uploaded_fail'), '', 5000);
          }
        );
      }
    }
  }

  /**
   * cancel uploading file
   */
  cancelUpload() {
    this.uploadSub.unsubscribe();
    this.reset();
  }

  /**
   * remove file from list
   * @param  {any} fileData
   */
  removeFile(fileData: any) {
    if (fileData.file_key) {
      this.broadcast.deleteFileByFileKey(fileData.file_key).subscribe(response => {
        this.files = this.files.filter(file => file.file_key !== fileData.file_key);
      });
    } else {
      this.file_ids.push(fileData.file_id);
      this.files = this.files.filter(file => file.file_id !== fileData.file_id);
    }
  }

  /**
   * reset file upload queue
   */
  reset() {
    this.uploadProgress = null;
    this.uploadSub = null;
  }

  /**
   * save/update broadcast data
   */
  save() {
    if (this.newBroadcastGroup.invalid) {
      this.newBroadcastGroup.markAllAsTouched();
      this.newBroadcastGroup.updateValueAndValidity();
      this.snackbarService.openSnackBar(this.translate.instant('lang_broadcast_error'), '', 5000);
      return;
    }

    if (this._id) {
      let obj = this.newBroadcastGroup.value;
      obj.broadcast_id = this._id;
      obj.recipient = this.recipient;
      obj.file_ids = this.file_ids;
      obj.attachment = this.attachment;
      this.broadcast
        .update(obj)
        .pipe(take(1))
        .subscribe(
          response => {
            if (response) {
              this.router.navigate(['/dashboard/broadcasts/empfaenger/' + this._id]);
            }
          },
          (err: any) => {
            this.snackbarService.openSnackBar(this.translate.instant('lang_broadcast_unable_to_update'), '', 5000);
          }
        );
    } else {
      let obj = this.newBroadcastGroup.value;
      obj.attachment = this.attachment;
      this.broadcast
        .save(obj)
        .pipe(take(1))
        .subscribe(
          (response: StyResponse) => {
            if (response) {
              this.router.navigate(['/dashboard/broadcasts/empfaenger/' + response.result._id]);
            }
          },
          (err: any) => {
            this.snackbarService.openSnackBar(this.translate.instant('lang_broadcast_unable_to_add'), '', 5000);
          }
        );
    }
  }

  /**
   * get broadcast data by id
   */
  getContent() {
    this.router.navigate(['/dashboard/broadcasts/bearbeiten/' + this._id]);
  }

  /**
   * active history component
   */
  getHistory() {
    this.router.navigate(['/dashboard/broadcasts/historie/' + this._id]);
  }
}
