import { Test, TestingModule } from '@nestjs/testing';
import { PackerService } from './packer.service';

describe('PackerService', () => {
  let service: PackerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PackerService],
    }).compile();

    service = module.get<PackerService>(PackerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
