import {
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  Sequelize,
} from 'sequelize-typescript';
import { Field, ID } from 'type-graphql';

import { Cart } from './cart.entity';
import { Inventory } from './inventory.entity';

@Table({
  tableName: 'cart_inventories',
  underscored: true,
})
export class CartInventory extends Model<CartInventory> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @ForeignKey(() => Cart)
  @Column(DataType.UUID)
  cartId!: string;

  @ForeignKey(() => Inventory)
  @Column(DataType.UUID)
  inventoryId!: string;
}
