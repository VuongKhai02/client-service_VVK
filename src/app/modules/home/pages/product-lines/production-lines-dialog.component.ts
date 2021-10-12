import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AssetService } from '@app/core/public-api';
import { Asset, AssetInfo, AssetSearchQuery } from '@app/shared/models/asset.models';
import { AttributeService } from '@core/http/attribute.service';
import { AttributeData, AttributeScope} from '@shared/models/telemetry/telemetry.models';

@Component({
  selector: 'tb-production-lines-dialog',
  templateUrl: './production-lines-dialog.component.html',
  styleUrls: ['./production-lines-dialog.component.scss']
})
export class ProductionLinesDialogComponent implements OnInit {

  constructor(private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProductionLinesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private assetService: AssetService,
    private attributeService: AttributeService) { }

  productionLineForm = this.fb.group({
    nameProductionLine: [''],
    codePo: [''],
    branch: [''],
    productionLineMachine: [''],
    codeProduct: [''],
    nameProduct: [''],
    codeWo: [''],
    deviceList: []
  })
  ngOnInit(): void {
  }

  cancel() {
    this.dialogRef.close();
  }

  add() {
    const asset: Asset = {
      name: this.productionLineForm.value.nameProductionLine,
      type: this.productionLineForm.value.codePo,
      label: this.productionLineForm.value.branch
    }

    const attributes: Array<AttributeData> = [
      {
        key: "productionLineMachine",
        value: this.productionLineForm.value.productionLineMachine
      },
      {
        key: "codeProduct",
        value: this.productionLineForm.value.codeProduct
      },
      {
        key: "nameProduct",
        value: this.productionLineForm.value.nameProduct
      },
      {
        key: "codeWo",
        value: this.productionLineForm.value.codeWo
      },
      {
        key: "deviceList",
        value: this.productionLineForm.value.deviceList
      }
    ]

    this.assetService.saveAsset(asset).subscribe(data => {
      console.log(data);
      this.attributeService.saveEntityAttributes(data.id, AttributeScope.SERVER_SCOPE, attributes).subscribe(attr => {
        console.log(attr);
        this.dialogRef.close();
      })
    })
  }

}
