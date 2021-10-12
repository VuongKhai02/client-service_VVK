import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProductionLinesDialogComponent } from './production-lines-dialog.component';

@Component({
  selector: 'tb-product-lines',
  templateUrl: './product-lines.component.html',
  styleUrls: ['./product-lines.component.scss']
})
export class ProductLinesComponent implements OnInit {

  constructor(    
    public dialog: MatDialog
    ) { }

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

}
