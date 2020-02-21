import { Test, TestingModule } from '@nestjs/testing';
import { EasypostService } from './easypost.service';

describe('EasypostService', () => {
  let service: EasypostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EasypostService],
    }).compile();

    service = module.get<EasypostService>(EasypostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
