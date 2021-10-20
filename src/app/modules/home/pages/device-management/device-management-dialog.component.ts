import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { DeviceService } from '@core/http/device.service';
import { Device, DeviceCredentialsType } from '@shared/models/device.models';
import { AttributeService } from '@core/http/attribute.service';
import { EntityId } from '@shared/models/id/entity-id';
import { AttributeData, AttributeScope, DataSortOrder, TimeseriesData } from '@shared/models/telemetry/telemetry.models';
import { AssetService } from '@app/core/public-api';
import { PageLink } from '@app/shared/public-api';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';

@Component({
  selector: 'tb-device-management-dialog',
  templateUrl: './device-management-dialog.component.html',
  styleUrls: ['./device-management-dialog.component.scss']
})
export class DeviceManagementDialogComponent implements OnInit {
  deviceForm = this.fb.group({
    name: [this.data.type == "edit" ? this.data.element.element.name: ''],
    codeMachine: [this.data.type == "edit" ?this.data.element.element.label: ''],
    serial: [this.data.type == "edit" ?this.data.element.serial: ''],
    entityType: [this.data.type == "edit" ?this.data.element.element.type: ''],
    machineList: [this.data.type == "edit" ?this.data.element.machineList: ''],
    plcList: [this.data.type == "edit" ?this.data.element.plcList: '']
  });
  pageLink: PageLink;
  machineAll: any;
  machines: String[] = this.data.element.machineList ? this.data.element.machineList: [];
  plcAll: any;
  plcs: String[] = this.data.element.plcList ? this.data.element.plcList: [];
  selectable = true;
  removable = true;
  addOnBlur = true;
  constructor(
    public dialogRef: MatDialogRef<DeviceManagementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private deviceService: DeviceService,
    private attributeService: AttributeService,
    private assetService: AssetService
  ) { 
    this.pageLink = new PageLink(50, 0);
  }

  ngOnInit(): void {
    this.getAllAssetByType('machine');
    this.getAllAssetByType('plc');
  }

  cancel() {
    this.dialogRef.close();
  }

  getAllAssetByType(assetType: string) {
    this.assetService.getTenantAssetInfos(this.pageLink, assetType).subscribe(data => {
      if(assetType == 'machine') {
        this.machineAll = data.data;
      } else {
        this.plcAll = data.data;
      }
    })
  }

  add() {
    console.log(this.deviceForm);
    const device: Device = {
      name: this.deviceForm.value.name,
      type: this.deviceForm.value.entityType,
      label: this.deviceForm.value.codeMachine
    }
    this.deviceService.saveDevice(device).subscribe((data:any) => {
      console.log("Device: ", data);
      const attributes: Array<AttributeData> = [
        {
          key: "machineList",
          value: this.machines
        },
        {
          key: "plcList",
          value: this.plcs
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

  update() {
    const device: Device = this.data.element.element;
    device.name = this.deviceForm.value.name;
    device.type = this.deviceForm.value.entityType;
    device.label = this.deviceForm.value.codeMachine;
    this.deviceService.saveDevice(device).subscribe((data:any) => {
      const attributes: Array<AttributeData> = [
        {
          key: "machineList",
          value: this.machines
        },
        {
          key: "plcList",
          value: this.plcs
        },
        {
          key: "serial",
          value: this.deviceForm.value.serial
        }
      ]
      
      this.attributeService.saveEntityAttributes(data.id, AttributeScope.SERVER_SCOPE, attributes).subscribe((data) => {
        console.log("attribute: ", data);
        this.deviceService.filter('Update device');
        this.dialogRef.close();
      })
    })

  }

  remove(machine: String, type): void {
    if(type == 1) {
      const index = this.machines.indexOf(machine);

      if (index >= 0) {
        this.machines.splice(index, 1);
      }
    } else {
      const index = this.plcs.indexOf(machine);

      if (index >= 0) {
        this.plcs.splice(index, 1);
      }
    }

  }

  selected(event: MatAutocompleteSelectedEvent, type): void {
    console.log(this.machines);
    if(type == 1) {
      if(!this.machines.includes(event.option.viewValue)) {
        this.machines.push(event.option.viewValue);
      }
    } else {
      if(!this.plcs.includes(event.option.viewValue)) {
        this.plcs.push(event.option.viewValue);
      }
    }
    
  }
}
