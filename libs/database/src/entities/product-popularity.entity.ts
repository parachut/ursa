import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  Default,
  Sequelize,
} from 'sequelize-typescript';

import { Product } from './product.entity';

@Table({
  tableName: 'product_popularities',
  underscored: true,
})
export class ProductPopularity extends Model<ProductPopularity> {
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Column
  popularity!: number;

  @Column
  views!: number;

  @Column
  count!: number;

  @Column
  comments?: number;

  @Column
  ratings?: number;

  @BelongsTo(() => Product)
  product!: Product;

  @ForeignKey(() => Product)
  @Column(DataType.UUID)
  productId!: string;

  @CreatedAt
  createdAt!: Date;
}
