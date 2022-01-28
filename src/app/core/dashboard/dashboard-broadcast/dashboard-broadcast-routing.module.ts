import { BroadcastRecipientsListComponent } from './broadcast-recipients-list/broadcast-recipients-list.component';
import { BroadcastListComponent } from './broadcast-list/broadcast-list.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {DashboardBroadcastComponent} from '@app/dashboard/dashboard-broadcast/dashboard-broadcast.component';
import { BroadcastFormComponent } from '@app/dashboard/dashboard-broadcast/broadcast-form/broadcast-form.component';

const routes: Routes = [
  // Module is lazy loaded, see app-routing.module.ts
  {
    path: '',
    component: BroadcastListComponent,
  },
  {
    path: 'erstellen',
    component: DashboardBroadcastComponent,
  },
  {
    path: 'neu',
    component: BroadcastFormComponent,
  },
  {
    path: 'bearbeiten/:id',
    component: BroadcastFormComponent,
  },
  {
    path: 'historie/:id', //history
    component: BroadcastFormComponent,
  },
  {
    path: 'empfaenger/:id',
    component: BroadcastRecipientsListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class DashboardBroadcastRoutingModule {}
