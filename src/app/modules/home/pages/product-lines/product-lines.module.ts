import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { MatDialogModule } from '@angular/material/dialog';
import { ChartsModule } from 'ng2-charts';
import { ProductLinesRoutingModule } from './product-lines-routing.module';
import { ProductLinesComponent } from './product-lines.component';
import { ProductionLinesDialogComponent } from './production-lines-dialog.component';
import { ProductionLinesDialogDeleteComponent } from './production-lines-dialog-delete.component';

@NgModule({
  declarations: [
    ProductLinesComponent,
    ProductionLinesDialogComponent,
    ProductionLinesDialogDeleteComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatDialogModule,
    ChartsModule,
    ProductLinesRoutingModule
  ]
})
export class ProductLinesModule { }
