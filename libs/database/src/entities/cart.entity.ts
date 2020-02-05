import {
  BelongsTo,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { Field, ID, ObjectType } from 'type-graphql';

import { Address } from './address.entity';
import { CartInventory } from './cart-inventory.entity';
import { CartItem } from './cart-item.entity';
import { Inventory } from './inventory.entity';
import { Shipment } from './shipment.entity';
import { User } from './user.entity';

@ObjectType()
@Table({
  tableName: 'carts',
  underscored: true,
})
export class Cart extends Model<Cart> {
  /**
   * ID
   */
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.literal('uuid_generate_v4()'))
  @Column(DataType.UUID)
  readonly id!: string;

  /**
   * Database Fields
   */
  @Field({ nullable: true })
  @Column
  canceledAt?: Date;

  @Column
  chargeId?: string;

  @Field({ nullable: true })
  @Column
  completedAt?: Date;

  @Field({ nullable: true })
  @Column
  confirmedAt?: Date;

  @Field({ nullable: true })
  @Column
  planId?: string;

  @Field({ nullable: true })
  @Column
  couponCode?: string;

  @Field()
  @Default(true)
  @Column
  protectionPlan!: boolean;

  @Column
  refundId?: string;

  @Field({ nullable: true })
  @Default('Ground')
  @Column
  service!: string;

  /**
   * Database Relationships
   */
  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => Address)
  address?: Address;

  @ForeignKey(() => Address)
  @Column(DataType.UUID)
  addressId?: string;

  @HasMany(() => CartItem, 'cartId')
  items: CartItem[];

  @HasMany(() => Shipment, 'cartId')
  shipments: Shipment[];

  @BelongsToMany(
    () => Inventory,
    () => CartInventory,
  )
  inventory: Inventory[];

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
