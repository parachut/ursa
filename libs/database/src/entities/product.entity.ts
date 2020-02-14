import { Client } from '@elastic/elasticsearch';
import * as slugify from '@sindresorhus/slugify';
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

const elasti = new Client({
  node:
    'https://elastic:acNbgQRsl0OUznitAboYVss6@cb0a068fb8d64b3294ede898764e8f96.us-central1.gcp.cloud.es.io:9243',
});

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
  static async createElastic(instance: Product) {
    const [brand, category, inventory] = await Promise.all([
      instance.$get('brand'),
      instance.$get('category'),
      instance.$get('inventory'),
    ]);

    await elasti.index({
      index: 'products',
      body: {
        id: instance.id,
        name: instance.name,
        category: category
          ? {
              name: category.name,
              id: category.id,
              slug: category.slug,
            }
          : null,
        brand: brand
          ? {
              name: brand.name,
              id: brand.id,
              slug: brand.slug,
            }
          : null,
        slug: instance.slug,
        aliases: instance.aliases
          ? instance.aliases.split(',').map(a => a.trim())
          : null,
        stock: inventory.filter(i => i.status === 'INWAREHOUSE').length,
        points: instance.points,
        images: instance.images,
        popularity: instance.popularity,
        demand: instance.demand,
        lastInventoryCreated: instance.lastInventoryCreated,
      },
    });
  }

  @AfterUpdate
  static async updateElastic(instance: Product) {
    if (instance.id) {
      try {
        await elasti.updateByQuery({
          index: 'products',
          body: {
            query: {
              match_phrase: { id: instance.get('id') },
            },
            script: {
              source:
                'ctx._source.stock = params.stock; ctx._source.points = params.points; ctx._source.popularity = params.popularity; ctx._source.demand = params.demand; ctx._source.lastInventoryCreated = params.lastInventoryCreated;',
              params: {
                stock: instance.stock,
                points: instance.points,
                popularity: instance.popularity,
                demand: instance.demand,
                lastInventoryCreated:
                  instance.lastInventoryCreated || new Date(),
              },
            },
          },
        });
      } catch (e) {
        console.log(e);
      }
    }
  }
}
