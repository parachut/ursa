import { Test, TestingModule } from '@nestjs/testing';
import { ShipmentResolver } from './shipment.resolver';

describe('ShipmentResolver', () => {
  let resolver: ShipmentResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShipmentResolver],
    }).compile();

    resolver = module.get<ShipmentResolver>(ShipmentResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
