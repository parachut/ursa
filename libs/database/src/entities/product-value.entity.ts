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
import { InventoryCondition } from '../enums/inventory-condition.enum';

@ObjectType()
@Table({
  tableName: 'product_values',
  underscored: true,
})
export class ProductValue extends Model<ProductValue> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Field()
  @Column
  value!: string;

  @BelongsTo(() => Product)
  product: Product;

  @ForeignKey(() => Product)
  @Column(DataType.UUID)
  productId!: string;

  @Field(type => InventoryCondition)
  @Default(InventoryCondition.NEW)
  @Column(
    DataType.ENUM({
      values: Object.values(InventoryCondition),
    }),
  )
  condition!: InventoryCondition;

  @Field()
  @Column
  source!: string;

  @Field(() => Date)
  @CreatedAt
  createdAt!: Date;

  @Field(() => Date)
  @UpdatedAt
  updatedAt!: Date;

  @Field()
  @Column
  mfr!: string;

  @Field()
  @Column
  kehName!: string;

  @Field()
  @Column
  mpbName!: string;
}
