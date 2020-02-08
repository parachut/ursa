import { Test, TestingModule } from '@nestjs/testing';
import { CartItemResolver } from './cart-item.resolver';

describe('CartItemResolver', () => {
  let resolver: CartItemResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CartItemResolver],
    }).compile();

    resolver = module.get<CartItemResolver>(CartItemResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
