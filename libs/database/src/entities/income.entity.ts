import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
  Sequelize,
} from 'sequelize-typescript';
import { Field, ID, ObjectType } from 'type-graphql';

import { User } from './user.entity';
import { Inventory } from './inventory.entity';

@ObjectType()
@Table({
  tableName: 'incomes',
  underscored: true,
})
export class Income extends Model<Income> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Field()
  @Default(0)
  @Column
  commission!: number;

  @Field()
  @Default(0)
  @Column
  dailyRate!: number;

  @Field()
  @Default(false)
  @Column
  membership!: boolean;

  @Field({ nullable: true })
  @Column
  planId?: string;

  @Field({ nullable: true })
  @Column
  notes?: string;

  @Field({ nullable: true })
  @Column
  transferId?: string;

  @BelongsTo(() => User, 'userId')
  user!: User;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User, 'memberId')
  member!: User;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  memberId!: string;

  @BelongsTo(() => Inventory, 'inventoryId')
  inventory!: Inventory;

  @ForeignKey(() => Inventory)
  @Column(DataType.UUID)
  inventoryId!: string;

  @Column
  createdAt!: Date;

  @Column
  updatedAt!: Date;
}
