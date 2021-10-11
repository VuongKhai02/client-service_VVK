import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceManagementDialogComponent } from './device-management-dialog.component';

describe('DeviceManagementDialogComponent', () => {
  let component: DeviceManagementDialogComponent;
  let fixture: ComponentFixture<DeviceManagementDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeviceManagementDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceManagementDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
