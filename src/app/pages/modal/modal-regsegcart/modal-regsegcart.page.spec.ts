import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRegSegCartPage } from './modal-regsegcart.page';

describe('ModalActClientePage', () => {
  let component: ModalRegSegCartPage;
  let fixture: ComponentFixture<ModalRegSegCartPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalRegSegCartPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalRegSegCartPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
