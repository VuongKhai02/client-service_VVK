import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProductionLinesDialogComponent } from './production-lines-dialog.component';
import { AssetService } from '@app/core/public-api';
import { PageLink } from '@app/shared/public-api';
import { AttributeService } from '@app/core/public-api';
@Component({
  selector: 'tb-product-lines',
  templateUrl: './product-lines.component.html',
  styleUrls: ['./product-lines.component.scss']
})
export class ProductLinesComponent implements OnInit {

  constructor(    
    public dialog: MatDialog,
    private assetService: AssetService,
    private attributeService: AttributeService
    ) { 
      this.pageLink = new PageLink(10, 0);
    }
  pageLink: PageLink;
  dataSource: any;

  ngOnInit(): void {

  }

  openDialog(element): void {
    console.log("Open dialog:", element)
    const dialogRef = this.dialog.open(ProductionLinesDialogComponent, {
      panelClass: ['tb-dialog', 'tb-fullscreen-dialog'],
      width: '600px',
      height: '700px',
      // data: { element: element == "-1" ? any : element }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  getAllAssets(): void {
    this.assetService.getTenantAssetInfos(this.pageLink).subscribe(data => {

    })
  }
  public handlePage(e) {
    console.log("Page size + page index: ", e.pageIndex + " " + e.pageSize);
    this.pageLink.page = e.pageIndex;
    this.pageLink.pageSize = e.pageSize;
    this.getAllAssets();
  }

}
