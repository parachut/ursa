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
import { Inventory } from './inventory.entity';
import { ReturnInventory } from './return-inventory.entity';
import { Shipment } from './shipment.entity';
import { User } from './user.entity';

@ObjectType()
@Table({
  tableName: 'returns',
  underscored: true,
})
export class Return extends Model<Return> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Field({ nullable: true })
  @Column
  completedAt?: Date;

  @Field({ nullable: true })
  @Column
  confirmedAt?: Date;

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

  @HasMany(() => Shipment, 'returnId')
  shipments: Shipment[];

  @BelongsToMany(
    () => Inventory,
    () => ReturnInventory,
  )
  inventory: Inventory[];

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
