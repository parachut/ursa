import { Test, TestingModule } from '@nestjs/testing';
import { ShipKitResolver } from './ship-kit.resolver';

describe('ShipKitResolver', () => {
  let resolver: ShipKitResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShipKitResolver],
    }).compile();

    resolver = module.get<ShipKitResolver>(ShipKitResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
