import {
  Column,
  CreatedAt,
  DataType,
  Default,
  BelongsTo,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
  ForeignKey,
  UpdatedAt,
} from 'sequelize-typescript';
import { Field, ID, ObjectType } from 'type-graphql';

import { Bin } from './bin.entity';

@ObjectType()
@Table({
  tableName: 'bin_free_nodes',
  underscored: true,
})
export class BinFreeNode extends Model<BinFreeNode> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Field()
  @Column(DataType.REAL)
  width!: number;

  @Field()
  @Column(DataType.REAL)
  height!: number;

  @Field()
  @Column(DataType.REAL)
  x!: number;

  @Field()
  @Column(DataType.REAL)
  y!: number;

  @BelongsTo(() => Bin, 'binId')
  bin!: Bin;

  @ForeignKey(() => Bin)
  @Column(DataType.UUID)
  binId!: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
