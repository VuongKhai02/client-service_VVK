import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DeviceService } from '@app/core/public-api';
import { AttributeService } from '@app/core/public-api';
import { AttributeData, AttributeScope, DataSortOrder, TimeseriesData } from '@shared/models/telemetry/telemetry.models';

@Component({
  selector: 'tb-device-management-dialog-delete',
  templateUrl: './device-management-dialog-delete.component.html',
  styleUrls: ['./device-management-dialog-delete.component.scss']
})
export class DeviceManagementDialogDeleteComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<DeviceManagementDialogDeleteComponent> ,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private deviceService: DeviceService,
    private attributeService: AttributeService
  ) { }

  ngOnInit(): void {
  }

  cancel() {
    this.dialogRef.close();
  }

  delete() {
    console.log(this.data);
    const attributes: Array<AttributeData> = [];
    if(this.data.element.machineList.length > 0) {
      attributes.push({
        key: "machineList",
        value: this.data.element.machineList
      })
    }
    if(this.data.element.plcList.length > 0) {
      attributes.push({
        key: "plcList",
        value: this.data.element.plcList
      })
    }
    if(this.data.element.serial != "") {
      attributes.push({
        key: "serial",
        value: this.data.element.serial
      })
    }
    if(attributes.length > 0) {
      this.attributeService.deleteEntityAttributes(this.data.element.element.id, AttributeScope.SERVER_SCOPE, attributes).subscribe((data) => {
        this.deviceService.filter('Delete Device');
        this.dialogRef.close();
      })
    }
  
    this.deviceService.deleteDevice(this.data.element.element.id.id).subscribe(data=> {
        this.deviceService.filter('Delete Device');
        this.dialogRef.close();
    });
  }

}
