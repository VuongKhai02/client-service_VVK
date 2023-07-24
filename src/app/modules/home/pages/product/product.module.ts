///
/// Author huongnv75
///

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { MatDialogModule } from '@angular/material/dialog';
import { ProductRoutingModule } from './product-routing.module';
import { ProductComponent } from './product.component';
import { ChartsModule } from 'ng2-charts';
import { ProductDialogComponent } from './product-dialog.component';
import { ProductDialogDeleteComponent } from './product-dialog-delete.component';

@NgModule({
  declarations: [
    ProductComponent,
    ProductDialogComponent,
    ProductDialogDeleteComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatDialogModule,
    ProductRoutingModule,
    ChartsModule
  ]
})
export class ProductModule { }
