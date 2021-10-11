import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { MatDialogModule } from '@angular/material/dialog';
import { ChartsModule } from 'ng2-charts';

import { DeviceManagementRoutingModule } from './device-management-routing.module';
import { DeviceManagementComponent } from './device-management.component';
import { DeviceManagementDialogComponent } from './device-management-dialog.component';
import { DeviceDashboardComponent } from './device-dashboard.component';
import { DeviceManagementDialogDeleteComponent } from './device-management-dialog-delete.component';


@NgModule({
  declarations: [
    DeviceManagementComponent,
    DeviceManagementDialogComponent,
    DeviceDashboardComponent,
    DeviceManagementDialogDeleteComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    DeviceManagementRoutingModule,
    MatDialogModule,
    ChartsModule
  ],
  exports: [
  ]
})
export class DeviceManagementModule { }
