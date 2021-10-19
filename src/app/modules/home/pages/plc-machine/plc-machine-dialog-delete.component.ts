import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'tb-plc-machine-dialog-delete',
  templateUrl: './plc-machine-dialog-delete.component.html',
  styleUrls: ['./plc-machine-dialog-delete.component.scss']
})
export class PlcMachineDialogDeleteComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PlcMachineDialogDeleteComponent> ,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
  }

  cancel(): void {
    this.dialogRef.close();
  }

  delete(): void {

  }

}
