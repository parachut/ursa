import {
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
import { Field, ID, ObjectType, Root } from 'type-graphql';

import { Product } from './product.entity';
import { User } from './user.entity';

@ObjectType()
@Table({
  tableName: 'queues',
  underscored: true,
})
export class Queue extends Model<Queue> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Field({ nullable: true })
  @Column
  lastNotified?: Date;

  @BelongsTo(() => Product)
  async product(@Root() queue: Queue): Promise<Product> {
    return Product.findByPk(queue.productId);
  }

  @ForeignKey(() => Product)
  @Column(DataType.UUID)
  productId!: string;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
