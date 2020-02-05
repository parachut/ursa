import {
  Column,
  CreatedAt,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { Field, ID, ObjectType } from 'type-graphql';

import { Inventory } from './inventory.entity';

@ObjectType()
@Table({
  tableName: 'bins',
  underscored: true,
})
export class Bin extends Model<Bin> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Field()
  @Column
  cell!: number;

  @Field()
  @Column
  column!: number;

  @Field()
  @Column
  row!: number;

  @Field()
  @Column
  location!: number;

  @HasMany(() => Inventory, 'binId')
  inventory: Inventory[];

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
