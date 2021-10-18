import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlcMachineDialogDeleteComponent } from './plc-machine-dialog-delete.component';

describe('PlcMachineDialogDeleteComponent', () => {
  let component: PlcMachineDialogDeleteComponent;
  let fixture: ComponentFixture<PlcMachineDialogDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlcMachineDialogDeleteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlcMachineDialogDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
