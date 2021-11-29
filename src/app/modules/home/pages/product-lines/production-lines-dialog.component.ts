import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AssetService } from '@app/core/public-api';
import { Asset } from '@app/shared/models/asset.models';
import { AttributeService } from '@core/http/attribute.service';
import { AttributeData, AttributeScope} from '@shared/models/telemetry/telemetry.models';
import { DeviceService } from '@core/http/device.service';
import { PageLink } from '@shared/models/page/page-link';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import { Device } from '@shared/models/device.models';
import productionLine from '@app/_files/production-lines.json';
import { FormControl } from '@material-ui/core';
@Component({
  selector: 'tb-production-lines-dialog',
  templateUrl: './production-lines-dialog.component.html',
  styleUrls: ['./production-lines-dialog.component.scss']
})
export class ProductionLinesDialogComponent implements OnInit {
  public productionLine:{key:string, name:string, type: string}[] = productionLine;
  constructor(private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProductionLinesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private assetService: AssetService,
    private attributeService: AttributeService,
    private deviceService: DeviceService) { 
      this.devices = this.data.element.deviceList ? this.data.element.deviceList: [];
    }
  productionLineForm = this.fb.group({
    name: [this.data.type == "edit" ? this.data.element.element.name: '', Validators.required],
    type: [this.data.type == "edit" ? this.data.eletment.element.type: '', Validators.required],
    label: ['', Validators.required],
    attributes: this.fb.group({})
    // attributes: this.fb.array([])
    // codePo: [this.data.type == "edit" ? this.data.element.codePo: ''],
    // branch: [this.data.type == "edit" ? this.data.element.element.branch: ''],
    // productionLineMachine: [this.data.type == "edit" ? this.data.element.productionLineMachine: ''],
    // codeProduct: [this.data.type == "edit" ? this.data.element.codeProduct: ''],
    // nameProduct: [this.data.type == "edit" ? this.data.element.nameProduct: ''],
    // codeWo: [this.data.type == "edit" ? this.data.element.codeWo: ''],
    // deviceList: [this.data.type == "edit" ? this.data.element.deviceList: '']
  });
  items = this.productionLineForm.get('attributes') as FormGroup;
  pageLink: PageLink;
  allDevices:any;
  devices: Device[] = [];
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  @ViewChild('deviceInput') deviceInput: ElementRef<HTMLInputElement>;
  ngOnInit(): void {
    console.log("File production line: ", this.productionLine)
    this.productionLine.forEach(p => {
      this.items.addControl(p.key, this.fb.control('', [Validators.required]));
    });
    this.productionLineForm.setControl('attributes', this.items);
    console.log(this.productionLineForm)
    this.getAllDevice();
  }

  cancel() {
    this.dialogRef.close();
  }

  add() {
    const asset: Asset = {
      name: this.productionLineForm.value.name,
      type: this.productionLineForm.value.name,
      label: this.productionLineForm.value.label
    }

    let attributes = [];
    console.log("AAAA: ", this.items);
    productionLine.forEach(p => {
      attributes.push({
        key: p.key,
        value: this.items.get(p.key).value
      })
    });

    console.log("Attributes ------------------->", attributes);

    this.assetService.saveAsset(asset).subscribe(data => {
      console.log("Save assets: ", data);
      this.attributeService.saveEntityAttributes(data.id, AttributeScope.SERVER_SCOPE, attributes).subscribe(attr => {
        console.log(attr);
        this.deviceService.filter('Add production lines');
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

  update() {
    const asset: Asset = this.data.element.element;
    asset.name = this.productionLineForm.value.nameProductionLine;
    asset.type = 'production lines';
    asset.label = this.productionLineForm.value.branch;
    this.assetService.saveAsset(asset).subscribe((data:any) => {
      let attributes:  Array<AttributeData>;
      productionLine.forEach(p => {
        attributes.push({
          key: p.key,
          value: this.productionLineForm.value.attributes
        })
      });
      this.attributeService.saveEntityAttributes(data.id, AttributeScope.SERVER_SCOPE, attributes).subscribe((data) => {
        console.log("attribute: ", data);
        this.deviceService.filter('Update device');
        this.dialogRef.close();
      })
    })

  }

  remove(device: Device): void {
    const index = this.devices.indexOf(device);

    if (index >= 0) {
      this.devices.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    console.log("Device load: ", this.devices);
    console.log(event.option.viewValue);
    // const deviceAdd = this.allDevices.find(d => d.name == event.option.viewValue);
    // console.log(deviceAdd);
    if(!this.devices.find(d => d.name == event.option.viewValue)) {
      const deviceAdd = this.allDevices.find(d => d.name == event.option.viewValue);
      this.devices.push(deviceAdd);
    }
  }


}
