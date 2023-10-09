import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanToProjectPageComponent } from './scan-to-project-page.component';

describe('ScanToProjectPageComponent', () => {
  let component: ScanToProjectPageComponent;
  let fixture: ComponentFixture<ScanToProjectPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScanToProjectPageComponent]
    });
    fixture = TestBed.createComponent(ScanToProjectPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
