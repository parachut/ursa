import { Test, TestingModule } from '@nestjs/testing';
import { QueueResolver } from './queue.resolver';

describe('QueueResolver', () => {
  let resolver: QueueResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueueResolver],
    }).compile();

    resolver = module.get<QueueResolver>(QueueResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
