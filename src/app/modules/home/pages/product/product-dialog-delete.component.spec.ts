import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductDialogDeleteComponent } from './product-dialog-delete.component';

describe('ProductDialogDeleteComponent', () => {
  let component: ProductDialogDeleteComponent;
  let fixture: ComponentFixture<ProductDialogDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductDialogDeleteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductDialogDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
