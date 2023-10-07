import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TouchAndTestFormatPositionComponent } from './touch-and-test-format-position.component';

describe('TouchAndTestFormatPositionComponent', () => {
  let component: TouchAndTestFormatPositionComponent;
  let fixture: ComponentFixture<TouchAndTestFormatPositionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TouchAndTestFormatPositionComponent]
    });
    fixture = TestBed.createComponent(TouchAndTestFormatPositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
