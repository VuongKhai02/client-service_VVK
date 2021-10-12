import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { DeviceService } from '@core/http/device.service';
import { Device, DeviceCredentialsType } from '@shared/models/device.models';
import { AttributeService } from '@core/http/attribute.service';
import { EntityId } from '@shared/models/id/entity-id';
import { AttributeData, AttributeScope, DataSortOrder, TimeseriesData } from '@shared/models/telemetry/telemetry.models';

@Component({
  selector: 'tb-device-management-dialog',
  templateUrl: './device-management-dialog.component.html',
  styleUrls: ['./device-management-dialog.component.scss']
})
export class DeviceManagementDialogComponent implements OnInit {
  deviceForm = this.fb.group({
    name: [this.data.name],
    codeMachine: [''],
    serial: [''],
    entityType: [''],
    machineList: ['']
  })
  constructor(
    public dialogRef: MatDialogRef<DeviceManagementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private deviceService: DeviceService,
    private attributeService: AttributeService
  ) { }

  ngOnInit(): void {
  }

  cancel() {
    this.dialogRef.close();
  }

  add() {
    console.log(this.deviceForm);
    const device: Device = {
      name: this.deviceForm.value.name,
      type: this.deviceForm.value.entityType,
      label: this.deviceForm.value.codeMachine
    }
    const machineListPush = this.deviceForm.value.machineList.split(",");
    this.deviceService.saveDevice(device).subscribe((data:any) => {
      console.log("Device: ", data);
      const attributes: Array<AttributeData> = [
        {
          key: "machineList",
          value: machineListPush
        },
        {
          key: "serial",
          value: this.deviceForm.value.serial
        }
      ]
      
      this.attributeService.saveEntityAttributes(data.id, AttributeScope.SERVER_SCOPE, attributes).subscribe((data) => {
        console.log("attribute: ", data);
        this.deviceService.filter('Add device');
        this.dialogRef.close();
      })
    })
  }
}
