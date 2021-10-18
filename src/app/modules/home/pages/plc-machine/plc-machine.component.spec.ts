import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlcMachineComponent } from './plc-machine.component';

describe('PlcMachineComponent', () => {
  let component: PlcMachineComponent;
  let fixture: ComponentFixture<PlcMachineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlcMachineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlcMachineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
