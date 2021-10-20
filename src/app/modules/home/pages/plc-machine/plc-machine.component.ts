import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AssetService } from '@app/core/public-api';
import { PageLink } from '@app/shared/public-api';
import {DeviceService } from '@app/core/public-api';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { PlcMachineDialogComponent } from './plc-machine-dialog.component';
import { any } from 'prop-types';
import { PlcMachineDialogDeleteComponent } from './plc-machine-dialog-delete.component';

@Component({
  selector: 'tb-plc-machine',
  templateUrl: './plc-machine.component.html',
  styleUrls: ['./plc-machine.component.scss']
})
export class PlcMachineComponent implements OnInit {
  displayedColumns: string[] = ['name', 'label', 'type', 'createdTime', 'edit', 'delete'];
  asset: FormGroup;
  pageLink: PageLink;
  dataSource: any;
  totalElements: number;
  constructor(private fb: FormBuilder,
    private assetService: AssetService,
    private deviceService: DeviceService,
    public dialog: MatDialog,
    ) {
      this.pageLink = new PageLink(10, 0);
      this.asset = this.fb.group({
        assetType: ['plc']
      });
      this.deviceService.listen().subscribe((m:any) => {
        this.getAssetByAssetType();
      })
   }

  ngOnInit(): void {
    this.getAssetByAssetType();
  }

  openDialog(element): void {
    console.log("Open dialog:", element)
    const dialogRef = this.dialog.open(PlcMachineDialogComponent, {
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
    const dialogRef = this.dialog.open(PlcMachineDialogDeleteComponent, {
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
    this.assetService.getTenantAssetInfos(this.pageLink, this.asset.value.assetType).subscribe(data => {
      this.dataSource = data.data;
    })
  }

}
