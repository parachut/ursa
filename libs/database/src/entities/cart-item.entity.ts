import {
  BeforeCreate,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { Field, ID, Int, ObjectType } from 'type-graphql';

import { Cart } from './cart.entity';
import { Product } from './product.entity';

@ObjectType()
@Table({
  tableName: 'cart_items',
  underscored: true,
})
export class CartItem extends Model<CartItem> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Field(type => Int)
  @Default(0)
  @Column
  points!: number;

  @Field(type => Int)
  @Default(0)
  @Column
  quantity!: number;

  @BelongsTo(() => Cart)
  cart!: Cart;

  @ForeignKey(() => Cart)
  @Column(DataType.UUID)
  cartId!: string;

  @BelongsTo(() => Product)
  product: Product;

  @ForeignKey(() => Product)
  @Column(DataType.UUID)
  productId!: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BeforeCreate
  static async setPoints(instance: CartItem) {
    const product = await instance.$get('product');

    instance.points = product.points;
    instance.quantity = instance.quantity || 1;
  }
}
