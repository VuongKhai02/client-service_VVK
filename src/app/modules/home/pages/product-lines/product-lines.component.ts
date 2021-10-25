import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProductionLinesDialogComponent } from './production-lines-dialog.component';
import { AssetService } from '@app/core/public-api';
import { PageLink } from '@app/shared/public-api';
import { AttributeService } from '@app/core/public-api';
import { ProductionLinesDialogDeleteComponent } from './production-lines-dialog-delete.component';
import { Router } from '@angular/router';
import { DeviceService } from '@app/core/public-api';
@Component({
  selector: 'tb-product-lines',
  templateUrl: './product-lines.component.html',
  styleUrls: ['./product-lines.component.scss']
})
export class ProductLinesComponent implements OnInit {
displayedColumns: string[] = ['nameProductionLine', 'codePo', 'branch', 'productionLineMachine', 'codeProduct', 'nameProduct', 'codeWo', 'deviceList', 'time', 'edit', 'delete'];

  constructor(    
    public dialog: MatDialog,
    private assetService: AssetService,
    private attributeService: AttributeService,
    private router: Router,
    private deviceService: DeviceService
    ) { 
      this.pageLink = new PageLink(10, 0);
      this.deviceService.listen().subscribe((m: any) => {
        console.log(m);
        this.getAttributes();
        this.getAllAssets();
      })
    }
  pageLink: PageLink;
  dataSource: any;
  listMachine: any; 
  totalElements: any;
  attributes: any;
  ngOnInit(): void {
    this.getAttributes();
    this.getAllAssets();
  }

  openDialog(element): void {
    console.log("Open dialog:", element)
    const dialogRef = this.dialog.open(ProductionLinesDialogComponent, {
      panelClass: ['tb-dialog', 'tb-fullscreen-dialog'],
      width: '600px',
      height: '550px',
      data: { element: element,
              type: element == -1 ? "add": "edit" }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  getAllAssets(): void {
    this.assetService.getTenantAssetInfos(this.pageLink, 'production lines').subscribe(data => {
      console.log("Production lines: ", data);
      this.dataSource = data.data;
      this.totalElements = data.totalElements;
      this.addAttrbutesInDataSource();
    })
  }

  getAttributes() {
    this.attributeService.getAttributesByEntityType('ASSET').subscribe((data: any) => {
      this.attributes = data;
      console.log("attribute assets: ", this.attributes);
    })
  }

  addAttrbutesInDataSource() {
    console.log("Add: ", this.dataSource);
    this.dataSource.forEach((element, index) => {
      const attributes = this.attributes.filter(attr => attr.entityId == element.id.id);
      this.dataSource[index] = {
        element,
        codePo: "",
        productionLineMachine: '',
        codeProduct: '',
        nameProduct: '',
        codeWo: '',
        deviceList: []
      }
      console.log("attrbutes filter: ", attributes);
      attributes.forEach(attr => {
        console.log("attr: ", attr.attributeKey);
        if (attr.attributeKey == "codePo") {
          this.dataSource[index].codePo = attr.strV;
        }
        if (attr.attributeKey == "productionLineMachine") {
          this.dataSource[index].productionLineMachine = attr.strV;
        }
        if(attr.attributeKey == "codeProduct") {
          this.dataSource[index].codeProduct = attr.strV;
        }
        if(attr.attributeKey == "codeWo") {
          this.dataSource[index].codeWo = attr.strV;
        }
        if(attr.attributeKey == "nameProduct") {
          this.dataSource[index].nameProduct = attr.strV;
        }
        if(attr.attributeKey == "deviceList") {
          this.dataSource[index].deviceList = JSON.parse(attr.jsonV);
        }
      });
    });
    console.log("dataSource: ", this.dataSource);
  }


  openDeleteDialog(element): void {
    console.log("Open dialog")
    const dialogRef = this.dialog.open(ProductionLinesDialogDeleteComponent, {
      panelClass: ['tb-dialog', 'tb-fullscreen-dialog'],
      width: '600px',
      data: { element: element}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  public handlePage(e) {
    console.log("Page size + page index: ", e.pageIndex + " " + e.pageSize);
    this.pageLink.page = e.pageIndex;
    this.pageLink.pageSize = e.pageSize;
    this.getAllAssets();
  }

  goToDashBoard(row) {
    console.log("Row: ", row);
    this.router.navigate(['/device-dashboard', row.element.id.id]);
  }

}
