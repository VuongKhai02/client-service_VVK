import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlcMachineComponent } from './plc-machine.component';

const routes: Routes = [{
  path: 'plc-machine',
  component: PlcMachineComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlcMachineRoutingModule { }
