import { Test, TestingModule } from '@nestjs/testing';
import { RecurlyService } from './recurly.service';

describe('RecurlyService', () => {
  let service: RecurlyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecurlyService],
    }).compile();

    service = module.get<RecurlyService>(RecurlyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
