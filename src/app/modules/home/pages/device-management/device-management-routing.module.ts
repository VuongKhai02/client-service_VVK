import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeviceDashboardComponent } from './device-dashboard.component';
import { DeviceManagementComponent } from './device-management.component';

const routes: Routes = [
  {
    path: 'device-management',
    component: DeviceManagementComponent,
  },
  {
    path: 'device-dashboard/:id',
    component: DeviceDashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeviceManagementRoutingModule { }
