import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import { Product } from './product.entity';
import { User } from './user.entity';

@Table({
  tableName: 'product_views',
  underscored: true,
})
export class ProductView extends Model<ProductView> {
  @PrimaryKey
  @Column(DataType.CIDR)
  ipAddress!: string;

  @BelongsTo(() => User)
  user?: User;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId?: string;

  @BelongsTo(() => Product)
  product!: Product;

  @PrimaryKey
  @ForeignKey(() => Product)
  @Column(DataType.UUID)
  productId!: string;

  @CreatedAt
  createdAt!: Date;
}
