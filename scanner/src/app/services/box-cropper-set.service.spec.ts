import { TestBed } from '@angular/core/testing';

import { BoxCropperSetService } from './box-cropper-set.service';

describe('BoxCropperSetService', () => {
  let service: BoxCropperSetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoxCropperSetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
