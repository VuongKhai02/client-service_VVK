import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityAutocompleteErrorComponent } from './entity-autocomplete-error.component';

describe('EntityAutocompleteErrorComponent', () => {
  let component: EntityAutocompleteErrorComponent;
  let fixture: ComponentFixture<EntityAutocompleteErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntityAutocompleteErrorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityAutocompleteErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
