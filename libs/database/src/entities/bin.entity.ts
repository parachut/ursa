import {
  AfterCreate,
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
import { BinFreeNode } from './bin-free-node.entity';

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

  @Field()
  @Column(DataType.REAL)
  width!: number;

  @Field()
  @Column(DataType.REAL)
  height!: number;

  @HasMany(() => Inventory, 'binId')
  inventory: Inventory[];

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @HasMany(() => BinFreeNode, 'binId')
  freeNodes: BinFreeNode[];

  @AfterCreate
  static async normalize(instance: Bin) {
    await instance.$create('freeNode', {
      width: instance.width,
      height: instance.height,
      x: 0,
      y: 0,
    });
  }
}
