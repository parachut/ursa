import * as slugify from '@sindresorhus/slugify';
import {
  BeforeCreate,
  Column,
  CreatedAt,
  DataType,
  Default,
  HasOne,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript';
import { Field, ID, ObjectType } from 'type-graphql';

import { File } from './file.entity';

@ObjectType()
@Table({
  tableName: 'brands',
  underscored: true,
})
export class Brand extends Model<Brand> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.literal('uuid_generate_v4()'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Field({ nullable: true })
  @Column
  logo?: string;

  @Field()
  @Unique
  @Column
  name!: string;

  @Field()
  @Unique
  @Column
  slug!: string;

  @Field()
  @Column
  url?: string;

  @HasOne(() => File, 'brandId')
  file?: File;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BeforeCreate
  static createSlug(instance: Brand) {
    instance.slug = slugify(instance.name);
  }
}
