import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceManagementDialogDeleteComponent } from './device-management-dialog-delete.component';

describe('DeviceManagementDialogDeleteComponent', () => {
  let component: DeviceManagementDialogDeleteComponent;
  let fixture: ComponentFixture<DeviceManagementDialogDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeviceManagementDialogDeleteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceManagementDialogDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
