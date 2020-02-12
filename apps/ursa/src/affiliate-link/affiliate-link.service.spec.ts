import { Test, TestingModule } from '@nestjs/testing';
import { AffiliateLinkService } from './affiliate-link.service';

describe('AffiliateLinkService', () => {
  let service: AffiliateLinkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AffiliateLinkService],
    }).compile();

    service = module.get<AffiliateLinkService>(AffiliateLinkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
