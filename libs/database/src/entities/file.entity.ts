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
  Unique,
  UpdatedAt,
} from 'sequelize-typescript';
import { Field, ID, ObjectType } from 'type-graphql';

import { Brand } from './brand.entity';
import { Product } from './product.entity';
import { ShipmentInspection } from './shipment-inspection.entity';

@ObjectType()
@Table({
  tableName: 'files',
  underscored: true,
})
export class File extends Model<File> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Field()
  @Unique
  @Column
  filename!: string;

  @Field()
  @Column
  contentType!: string;

  @Field({ nullable: true })
  @Column
  name?: string;

  @Field({ nullable: true })
  @Column
  description?: string;

  @BelongsTo(() => Brand, 'brandId')
  brand?: Brand;

  @ForeignKey(() => Brand)
  @Column(DataType.UUID)
  brandId?: string;

  @BelongsTo(() => Product, 'productId')
  product?: Product;

  @ForeignKey(() => Product)
  @Column(DataType.UUID)
  productId?: string;

  @BelongsTo(() => ShipmentInspection, 'shipmentInspectionId')
  shipmentInspection?: ShipmentInspection;

  @ForeignKey(() => ShipmentInspection)
  @Column(DataType.UUID)
  shipmentInspectionId?: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
