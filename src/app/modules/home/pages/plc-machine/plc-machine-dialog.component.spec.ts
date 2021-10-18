import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlcMachineDialogComponent } from './plc-machine-dialog.component';

describe('PlcMachineDialogComponent', () => {
  let component: PlcMachineDialogComponent;
  let fixture: ComponentFixture<PlcMachineDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlcMachineDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlcMachineDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
