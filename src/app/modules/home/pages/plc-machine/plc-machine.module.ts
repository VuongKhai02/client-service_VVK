import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { MatDialogModule } from '@angular/material/dialog';
import { PlcMachineRoutingModule } from './plc-machine-routing.module';
import { PlcMachineComponent } from './plc-machine.component';
import { ChartsModule } from 'ng2-charts';
import { PlcMachineDialogComponent } from './plc-machine-dialog.component';
import { PlcMachineDialogDeleteComponent } from './plc-machine-dialog-delete.component';

@NgModule({
  declarations: [
    PlcMachineComponent,
    PlcMachineDialogComponent,
    PlcMachineDialogDeleteComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatDialogModule,
    PlcMachineRoutingModule,
    ChartsModule
  ]
})
export class PlcMachineModule { }
