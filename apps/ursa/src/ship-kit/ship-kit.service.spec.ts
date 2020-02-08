import { Test, TestingModule } from '@nestjs/testing';
import { ShipKitService } from './ship-kit.service';

describe('ShipKitService', () => {
  let service: ShipKitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShipKitService],
    }).compile();

    service = module.get<ShipKitService>(ShipKitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
