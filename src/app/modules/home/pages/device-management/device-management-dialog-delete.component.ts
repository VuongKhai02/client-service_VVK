import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'tb-device-management-dialog-delete',
  templateUrl: './device-management-dialog-delete.component.html',
  styleUrls: ['./device-management-dialog-delete.component.scss']
})
export class DeviceManagementDialogDeleteComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<DeviceManagementDialogDeleteComponent> ,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
  }

  cancel() {
    this.dialogRef.close();
  }

  delete() {
    
  }

}
