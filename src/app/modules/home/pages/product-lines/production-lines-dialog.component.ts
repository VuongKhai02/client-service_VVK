import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AssetService } from '@app/core/public-api';
import { Asset, AssetInfo, AssetSearchQuery } from '@app/shared/models/asset.models';
import { AttributeService } from '@core/http/attribute.service';
import { AttributeData, AttributeScope} from '@shared/models/telemetry/telemetry.models';
import { DeviceService } from '@core/http/device.service';
import { PageLink } from '@shared/models/page/page-link';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import { Device } from '@shared/models/device.models';
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
    private attributeService: AttributeService,
    private deviceService: DeviceService) { }

  productionLineForm = this.fb.group({
    nameProductionLine: [''],
    codePo: [''],
    branch: [''],
    productionLineMachine: [''],
    codeProduct: [''],
    nameProduct: [''],
    codeWo: [''],
    deviceList: []
  });
  pageLink: PageLink;
  allDevices:any;
  devices: String[] = [];
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  @ViewChild('deviceInput') deviceInput: ElementRef<HTMLInputElement>;
  ngOnInit(): void {
    this.getAllDevice();
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
        value: this.devices
      }
    ];
    console.log("Attributes: ", attributes);

    this.assetService.saveAsset(asset).subscribe(data => {
      console.log(data);
      this.attributeService.saveEntityAttributes(data.id, AttributeScope.SERVER_SCOPE, attributes).subscribe(attr => {
        console.log(attr);
        this.dialogRef.close();
      })
    })
  }

  getAllDevice() {
    this.pageLink = new PageLink(50, 0);
    this.deviceService.getTenantDeviceInfosByDeviceProfileId(this.pageLink).subscribe(data => {
      this.allDevices = data.data;
    })
  }

  addDevice(event: MatChipInputEvent): void {
    // const value = event.value;

    // // Add our fruit
    // if (value) {
    //   this.devices.push(value);
    // }

    // Clear the input value
    // event.chipInput!.clear();
  }

  remove(device: String): void {
    const index = this.devices.indexOf(device);

    if (index >= 0) {
      this.devices.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    console.log(event.option.viewValue);
    if(!this.devices.includes(event.option.viewValue)) {
      this.devices.push(event.option.viewValue);
    }
  }


}
