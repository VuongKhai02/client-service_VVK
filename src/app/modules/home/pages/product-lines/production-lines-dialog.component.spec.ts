import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionLinesDialogComponent } from './production-lines-dialog.component';

describe('ProductionLinesDialogComponent', () => {
  let component: ProductionLinesDialogComponent;
  let fixture: ComponentFixture<ProductionLinesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductionLinesDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductionLinesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
