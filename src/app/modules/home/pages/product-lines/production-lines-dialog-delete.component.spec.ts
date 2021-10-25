import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionLinesDialogDeleteComponent } from './production-lines-dialog-delete.component';

describe('ProductionLinesDialogDeleteComponent', () => {
  let component: ProductionLinesDialogDeleteComponent;
  let fixture: ComponentFixture<ProductionLinesDialogDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductionLinesDialogDeleteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductionLinesDialogDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
