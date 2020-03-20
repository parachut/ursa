import { Test, TestingModule } from '@nestjs/testing';
import { ReturnResolver } from './return.resolver';

describe('ReturnResolver', () => {
  let resolver: ReturnResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReturnResolver],
    }).compile();

    resolver = module.get<ReturnResolver>(ReturnResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
