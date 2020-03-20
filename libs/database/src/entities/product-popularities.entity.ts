import {
  Sequelize,
  Column,
  Model,
  PrimaryKey,
  Table,
  Default,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { Field, ID, ObjectType } from 'type-graphql';

import { Product } from './product.entity';


@ObjectType()
@Table({
  tableName: 'product_popularities',
  underscored: true,
})
export class ProductPopularity extends Model<ProductPopularity> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @BelongsTo(() => Product)
  product: Product;

  @ForeignKey(() => Product)
  @Column(DataType.UUID)
  productId!: string;

  @Field()
  @Column
  popularity!: number;

  @Field()
  @Column
  views!: number;

  @Field()
  @Column
  count!: number;

  @Field()
  @Column
  comments!: number;

  @Field()
  @Column
  likes!: number;

  @Field()
  @Column
  ratings!: number;

  @Field(() => Date)
  @CreatedAt
  createdAt!: Date;

  @Field(() => Date)
  @UpdatedAt
  updatedAt!: Date;

  @Field()
  @Column
  minLikes!: number;

  @Field()
  @Column
  maxLikes!: number;

  @Field()
  @Column
  minViews!: number;

  @Field()
  @Column
  maxViews!: number;

  @Field()
  @Column
  minComments!: number;

  @Field()
  @Column
  maxComments!: number;

}
