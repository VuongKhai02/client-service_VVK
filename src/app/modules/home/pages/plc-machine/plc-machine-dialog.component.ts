import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AssetService } from '@app/core/public-api';
import { Asset } from '@app/shared/models/asset.models';
import { DeviceService } from '@app/core/public-api';
@Component({
  selector: 'tb-plc-machine-dialog',
  templateUrl: './plc-machine-dialog.component.html',
  styleUrls: ['./plc-machine-dialog.component.scss']
})
export class PlcMachineDialogComponent implements OnInit {
  assetForm = this.fb.group({
    name: [this.data.element.name],
    type: [this.data.name],
    label: [this.data.element.label]
  })
  constructor(public dialogRef: MatDialogRef<PlcMachineDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private assetService: AssetService,
    private deviceService: DeviceService) { }

  ngOnInit(): void {
  }

  cancel() {
    this.dialogRef.close();
  }

  add() {
    console.log("Data: ", this.data);
    const asset: Asset = {
      name: this.assetForm.value.name,
      type: this.data.name,
      label: this.assetForm.value.label
    }
    console.log("Asset: ", asset);
    this.assetService.saveAsset(asset).subscribe(data => {
      this.deviceService.filter('Add Asset');
      this.dialogRef.close();
    })
  }

  update() {
    // const asset: Asset = {
    //   name: this.assetForm.value.name,
    //   type: this.data.name,
    //   label: this.assetForm.value.label
    // }
    console.log(this.data);
    const asset: Asset = this.data.element;
    asset.label = this.assetForm.value.label;
    asset.name = this.assetForm.value.name;
    this.assetService.saveAsset(asset).subscribe(data => {
      console.log(data);
      this.deviceService.filter('Update Asset');
      this.dialogRef.close();
    })
  }

}
