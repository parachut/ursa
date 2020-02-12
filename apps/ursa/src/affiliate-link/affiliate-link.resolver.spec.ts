import { Test, TestingModule } from '@nestjs/testing';
import { AffiliateLinkResolver } from './affiliate-link.resolver';

describe('AffiliateLinkResolver', () => {
  let resolver: AffiliateLinkResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AffiliateLinkResolver],
    }).compile();

    resolver = module.get<AffiliateLinkResolver>(AffiliateLinkResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
