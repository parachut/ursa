import slugify from '@sindresorhus/slugify';
import {
  AfterCreate,
  AfterUpdate,
  BeforeCreate,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript';
import { Field, ID, Int, ObjectType } from 'type-graphql';

import { Brand } from './brand.entity';
import { Category } from './category.entity';
import { File } from './file.entity';
import { Inventory } from './inventory.entity';
import { ProductAttributeValue } from './product-attribute-value.entity';
import { Queue } from './queue.entity';

//App Search 
import AppSearchClient from '@elastic/app-search-node'
const appSearch = new AppSearchClient('host-qg17uk',
  'private-2w3xpb17ov3kqf1w7ewbpiaq')


@ObjectType()
@Table({
  tableName: 'products',
  underscored: true,
})
export class Product extends Model<Product> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Default(true)
  @Column
  active!: boolean;

  @Column(DataType.FLOAT)
  length?: number;

  @Field({ nullable: true })
  @Column(DataType.TEXT)
  description?: string;

  @Field(type => [String], { nullable: true })
  @Column(DataType.ARRAY(DataType.STRING(1024)))
  features?: string[];

  @Column(DataType.FLOAT)
  height?: number;

  @Field(type => [String])
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING(1024)))
  images?: string[];

  @Field(type => [String], { nullable: true })
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING(1024)))
  inTheBox?: string[];

  @Default([])
  @Column(DataType.ARRAY(DataType.FLOAT))
  estimatedEarnings?: number[];

  @Default(new Date())
  @Column
  lastInventoryCreated!: Date;

  @Field({ nullable: true })
  @Column
  mfr?: string;

  @Field()
  @Unique
  @Column
  name!: string;

  @Field()
  @Column
  elasticId?: string;

  @Field(type => Int)
  @Default(0)
  @Column
  points!: number;

  @Field(type => Int)
  @Default(0)
  @Column
  popularity!: number;

  @Field(type => Int, { nullable: true })
  @Column
  shippingWeight?: number;

  @Field()
  @Column
  slug!: string;

  @Field({ nullable: true })
  @Column
  aliases?: string;

  @Field(type => Int)
  @Default(0)
  @Column
  stock!: number;

  @Field(type => Int)
  @Default(0)
  @Column
  demand!: number;

  @Column
  weight?: number;

  @Column
  width?: number;

  @Column
  releaseDate?: Date;

  @HasMany(() => File, 'productId')
  files?: File[];

  @HasMany(() => Inventory, 'productId')
  inventory?: Inventory[];

  @HasMany(() => Queue, 'productId')
  queues?: Queue[];

  @HasMany(() => ProductAttributeValue, 'productId')
  attributesValues?: ProductAttributeValue[];

  @Field(type => Brand, { nullable: true })
  @BelongsTo(() => Brand)
  brand: Brand;

  @ForeignKey(() => Brand)
  @Column(DataType.UUID)
  brandId!: string;

  @BelongsTo(() => Category)
  category: Category;

  @ForeignKey(() => Category)
  @Column(DataType.UUID)
  categoryId?: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BeforeCreate
  static createSlug(instance: Product) {
    instance.slug = slugify(instance.name);
  }

  @AfterCreate
  static async createAppSearch(instance: Product) {
    const [brand, category, inventory] = await Promise.all([
      instance.$get('brand'),
      instance.$get('category'),
      instance.$get('inventory'),
    ]);

    const product = {
      id: instance.id,
      name: instance.name,
      mfr: instance.mfr,
      camera: category.name.includes('Camera')
        ? true
        : false,
      lens: category.name.includes('Lens')
        ? true
        : false,
      category_name: category
        ? category.name : null,
      category_id: category
        ? category.id : null,
      category_slug: category
        ? category.slug : null,
      brand_id: brand
        ? brand.id : null,
      brand_name: brand
        ? brand.name : null,
      brand_slug: brand
        ? brand.slug : null,
      slug: instance.slug,
      stock: inventory.filter((i) => i.status === 'INWAREHOUSE').length,
      points: instance.points,
      images: instance.images ? (instance.images[0] ? instance.images[0] : null) : null,
      popularity: instance.popularity,
      demand: instance.demand,
      last_inventory_created: instance.lastInventoryCreated,
    }

    await appSearch
      .indexDocuments('parachut', product)
      .then(response => console.log(response))
      .catch(error => console.log(error))

  }

  @AfterUpdate
  static async updateAppSearch(instance: Product) {
    if (instance.id) {

      await appSearch
        .indexDocuments('parachut',
          {
            id: instance.get('id'),
            stock: instance.stock,
            points: instance.points,
            popularity: instance.popularity,
            demand: instance.demand,
            lastInventoryCreated:
              instance.lastInventoryCreated || new Date(),
          })
        .then(response => console.log(response))
        .catch(error => console.log(error))

    }
  }

}
