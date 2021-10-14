import { Component, ViewChild, AfterViewInit, OnInit, Inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { PageLink } from '@shared/models/page/page-link';
import { DeviceService } from '@core/http/device.service';
import { EntityRelationService } from '@core/http/entity-relation.service';
import { DeviceManagementDialogComponent } from './device-management-dialog.component';
import { DeviceManagementDialogDeleteComponent } from './device-management-dialog-delete.component';
import { any } from 'prop-types';
import { AttributeService } from '@app/core/public-api';
@Component({
  selector: 'tb-device-management',
  templateUrl: './device-management.component.html',
  styleUrls: ['./device-management.component.scss']
})
export class DeviceManagementComponent implements AfterViewInit, OnInit {
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol', 'time', 'list', 'edit', 'delete'];
  dataSource: any;
  pageLink: PageLink;
  listMachine: any;
  totalElements: any;
  attributes: any;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private deviceService: DeviceService,
    private entityRelationService: EntityRelationService,
    public dialog: MatDialog,
    private attributeService: AttributeService
  ) {
    this.pageLink = new PageLink(10, 0);
    this.deviceService.listen().subscribe((m: any) => {
      console.log(m);
      this.getAttributes();
      this.getDeviceInfosByPageLink();
    })
  }

  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator;
    // console.log(this.paginator);
  }

  ngOnInit() {
    this.getAttributes();
    this.getDeviceInfosByPageLink();
  }

  findRelationByTo(id) {
    this.entityRelationService.findByTo(id).subscribe(data => this.listMachine = data);
  }

  getDeviceInfosByPageLink() {
    this.deviceService.getTenantDeviceInfosByDeviceProfileId(this.pageLink).subscribe((data) => {
      this.dataSource = data.data;
      this.totalElements = data.totalElements;
      this.addAttrbutesInDataSource();
    });
  }
  getAttributes() {
    this.attributeService.getAttributesByEntityType('DEVICE').subscribe((data: any) => {
      this.attributes = data;

    })
  }

  addAttrbutesInDataSource() {
    this.dataSource.forEach((element, index) => {
      const attributes = this.attributes.filter(attr => attr.entity_id == element.id.id);
      this.dataSource[index] = {
        element,
        serial: "",
        machineList: []
      }
      console.log("attrbutes filter: ", attributes);
      attributes.forEach(attr => {
        console.log("attr: ", attr.attribute_key);
        if (attr.attribute_key == "machineList") {
          this.dataSource[index].machineList = JSON.parse(attr.json_v);
        }
        if (attr.attribute_key == "serial") {
          console.log("AAA")
          this.dataSource[index].serial = attr.str_v;
        }
      });
    });
    console.log("dataSource: ", this.dataSource);
  }

  openDialog(element): void {
    console.log("Open dialog:", element)
    const dialogRef = this.dialog.open(DeviceManagementDialogComponent, {
      panelClass: ['tb-dialog', 'tb-fullscreen-dialog'],
      width: '600px',
      height: '450px',
      data: { element: element == "-1" ? any : element }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  openDeleteDialog(name): void {
    console.log("Open dialog")
    const dialogRef = this.dialog.open(DeviceManagementDialogDeleteComponent, {
      panelClass: ['tb-dialog', 'tb-fullscreen-dialog'],
      width: '600px',
      data: { name: name }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }


  public handlePage(e) {
    console.log("Page size + page index: ", e.pageIndex + " " + e.pageSize);
    this.pageLink.page = e.pageIndex;
    this.pageLink.pageSize = e.pageSize;
    this.getDeviceInfosByPageLink();
  }

}