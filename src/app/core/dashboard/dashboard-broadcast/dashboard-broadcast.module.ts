import { SyncfusionModule } from '@app/syncfusion/syncfusion.module';
import { FileManagementUploadModule } from './../../reusable-ui/file-upload/file-upload.module';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DashboardBroadcastComponent} from '@app/dashboard/dashboard-broadcast/dashboard-broadcast.component';
import {BroadcastListComponent} from '@app/dashboard/dashboard-broadcast/broadcast-list/broadcast-list.component';
import {BroadcastRecipientsListComponent} from '@app/dashboard/dashboard-broadcast/broadcast-recipients-list/broadcast-recipients-list.component';
import {BroadcastFormComponent} from '@app/dashboard/dashboard-broadcast/broadcast-form/broadcast-form.component';
import {BroadcastHistoryComponent} from '@app/dashboard/dashboard-broadcast/broadcast-history/broadcast-history.component';
import {SharedModule} from '@app/shared';
import {TranslateModule} from '@ngx-translate/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MaterialModule} from '@app/material.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ReusableUiModule} from '@app/reusable-ui/reusable-ui.module';
import {HeaderModule} from '@app/shell/headers/header.module';
import {ToggleNavigationModule} from '@app/shell/navigation/toggle-navigation/toggle-navigation.module';
import {DashboardNavigationModule} from '@app/shell/navigation/dashboard-navigation/dashboard-navigation.module';
import {DialogModule} from '@app/dialog/dialog.module';
import {ClipboardModule} from '@angular/cdk-experimental/clipboard';
import {DashboardBroadcastRoutingModule} from '@app/dashboard/dashboard-broadcast/dashboard-broadcast-routing.module';
import {LottieModule} from 'ngx-lottie';
import { DateRangePickerModule } from '@syncfusion/ej2-angular-calendars';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule,
    FlexLayoutModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    ReusableUiModule,
    HeaderModule,
    ToggleNavigationModule,
    DashboardNavigationModule,
    SharedModule,
    DialogModule,
    ClipboardModule,
    LottieModule,
    FileManagementUploadModule,
    DashboardBroadcastRoutingModule,
    DateRangePickerModule,
    SyncfusionModule
  ],
  declarations: [
    DashboardBroadcastComponent,
    DashboardBroadcastComponent,
    BroadcastListComponent,
    BroadcastRecipientsListComponent,
    BroadcastFormComponent,
    BroadcastHistoryComponent,
  ],
  exports: [
    DashboardBroadcastComponent,
    DashboardBroadcastComponent,
    BroadcastListComponent,
    BroadcastRecipientsListComponent,
    BroadcastFormComponent,
    BroadcastHistoryComponent,
    DateRangePickerModule,
    SyncfusionModule
  ]
})
export class DashboardBroadcastModule {
}
