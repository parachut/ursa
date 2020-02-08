import { Test, TestingModule } from '@nestjs/testing';
import { DwollaService } from './dwolla.service';

describe('DwollaService', () => {
  let service: DwollaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DwollaService],
    }).compile();

    service = module.get<DwollaService>(DwollaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
