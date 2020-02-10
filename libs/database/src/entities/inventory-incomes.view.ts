import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Field, ObjectType } from 'type-graphql';

import { Inventory } from './inventory.entity';

@ObjectType()
@Table({
  tableName: 'inventory_incomes',
  underscored: true,
  timestamps: false,
})
export class InventoryIncome extends Model<InventoryIncome> {
  @Field()
  @Column(DataType.REAL)
  days!: number;

  @Field()
  @Column(DataType.REAL)
  total!: number;

  @BelongsTo(() => Inventory)
  inventory!: Inventory;

  @PrimaryKey
  @ForeignKey(() => Inventory)
  @Column(DataType.UUID)
  inventoryId!: string;
}
