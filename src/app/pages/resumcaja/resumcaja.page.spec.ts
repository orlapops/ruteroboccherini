import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumCajaPage } from './resumcaja.page';

describe('ConsignarPage', () => {
  let component: ResumCajaPage;
  let fixture: ComponentFixture<ResumCajaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResumCajaPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResumCajaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
