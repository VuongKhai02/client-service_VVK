import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { AssetService } from '@app/core/public-api';
import { DeviceService } from '@app/core/public-api';
@Component({
  selector: 'tb-product-dialog-delete',
  templateUrl: './product-dialog-delete.component.html',
  styleUrls: ['./product-dialog-delete.component.scss']
})
export class ProductDialogDeleteComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ProductDialogDeleteComponent> ,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private assetService: AssetService,
    private deviceService: DeviceService
  ) { }

  ngOnInit(): void {
  }

  cancel(): void {
    this.dialogRef.close();
  }

  delete(): void {
    this.assetService.deleteAsset(this.data.element.id.id).subscribe(data => {
      console.log(data);
      this.deviceService.filter('Delete Asset');
      this.dialogRef.close();
    })
  }

}
