import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductLinesComponent } from './product-lines.component';

const routes: Routes = [{
  path: 'production-line',
  component: ProductLinesComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductLinesRoutingModule { }
