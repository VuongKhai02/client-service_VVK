import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IntegrationService } from '@app/core/public-api';
import { PageLink } from '@app/shared/public-api';
import {DeviceService } from '@app/core/public-api';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ProductDialogComponent } from './product-dialog.component';
import { any } from 'prop-types';
import { ProductDialogDeleteComponent } from './product-dialog-delete.component';

@Component({
  selector: 'tb-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
  displayedColumns: string[] = ['name', 'code', 'description','status', 'createdTime', 'edit', 'delete'];
  asset: FormGroup;
  pageLink: PageLink;
  dataSource: any;
  totalElements: number;
  constructor(private fb: FormBuilder,
    private integrationService: IntegrationService,
    private deviceService: DeviceService,
    public dialog: MatDialog,
    ) {
      this.pageLink = new PageLink(10, 0);
      this.asset = this.fb.group({
        assetType: ['product']
      });
      this.deviceService.listen().subscribe((m:any) => {
        this.getAssetByAssetType();
      })
   }

  ngOnInit(): void {
    this.getAssetByAssetType();
  }

  openDialog(element): void {
    console.log("Open dialog:", element, this.asset.value.assetType)
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      panelClass: ['tb-dialog', 'tb-fullscreen-dialog'],
      width: '600px',
      height: '300px',
      data: { element: element,
              name: this.asset.value.assetType,
              type: element == -1 ? "add": "edit" }
    });
    console.log(dialogRef);
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  openDeleteDialog(element): void {
    const dialogRef = this.dialog.open(ProductDialogDeleteComponent, {
      panelClass: ['tb-dialog', 'tb-fullscreen-dialog'],
      width: '600px',
      height: '230px',
      data: { element: element,
              name: this.asset.value.assetType }
    })
  }

  public onChangeAsset(e) {
    this.asset.patchValue({assetType: e.value});
    this.getAssetByAssetType();
  }

  public handlePage(e) {
    console.log("Page size + page index: ", e.pageIndex + " " + e.pageSize);
    this.pageLink.page = e.pageIndex;
    this.pageLink.pageSize = e.pageSize;
    this.getAssetByAssetType();
  }

  getAssetByAssetType(): void {
    let type = this.asset.value.assetType;
    if(type == 'group-product'){
      this.integrationService.getGroupProducts().subscribe(data => {
        this.dataSource = data.rows;
      });
    } else if(type == 'product'){
      this.integrationService.getProducts().subscribe(data => {
        this.dataSource = data.rows;
      })
    }else if(type == 'stage'){
      this.integrationService.getStages().subscribe(data => {
        this.dataSource = data.rows;
      })
    }else if(type == 'error'){
      this.integrationService.getErrors().subscribe(data => {
        this.dataSource = data.rows;
      })
    }
  }

}
