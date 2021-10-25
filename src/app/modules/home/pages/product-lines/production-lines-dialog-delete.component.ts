import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { AssetService, DeviceService } from '@app/core/public-api';
import { AttributeService } from '@app/core/public-api';
import { AttributeData, AttributeScope, DataSortOrder, TimeseriesData } from '@shared/models/telemetry/telemetry.models';

@Component({
  selector: 'tb-production-lines-dialog-delete',
  templateUrl: './production-lines-dialog-delete.component.html',
  styleUrls: ['./production-lines-dialog-delete.component.scss']
})
export class ProductionLinesDialogDeleteComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ProductionLinesDialogDeleteComponent> ,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private deviceService: DeviceService,
    private attributeService: AttributeService,
    private assetService: AssetService
  ) { }

  ngOnInit(): void {
  }
  cancel() {
    this.dialogRef.close();
  }

  delete() {
    console.log(this.data);
    const attributes: Array<AttributeData> = [];
    if(this.data.element.deviceList.length > 0) {
      attributes.push({
        key: "deviceList",
        value: this.data.element.deviceList
      })
    }
    if(this.data.element.productionLineMachine != "") {
      attributes.push({
        key: "productionLineMachine",
        value: this.data.element.productionLineMachine
      })
    }
    if(this.data.element.codeProduct != "") {
      attributes.push({
        key: "codeProduct",
        value: this.data.element.codeProduct
      })
    }
    if(this.data.element.nameProduct != "") {
      attributes.push({
        key: "nameProduct",
        value: this.data.element.nameProduct
      })
    }
    if(this.data.element.codeWo != "") {
      attributes.push({
        key: "codeWo",
        value: this.data.element.codeWo
      })
    }
    if(this.data.element.codePo != "") {
      attributes.push({
        key: "codePo",
        value: this.data.element.codePo
      })
    }
    if(attributes.length > 0) {
      this.attributeService.deleteEntityAttributes(this.data.element.element.id, AttributeScope.SERVER_SCOPE, attributes).subscribe((data) => {
        this.deviceService.filter('Delete Attribute Production Line');
        this.dialogRef.close();
      })
    }
  
    this.assetService.deleteAsset(this.data.element.element.id.id).subscribe(data=> {
        this.deviceService.filter('Delete Production Line');
        this.dialogRef.close();
    });
  }

}
