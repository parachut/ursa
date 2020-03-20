import slugify from '@sindresorhus/slugify';
import {
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
import { Field, ID, ObjectType } from 'type-graphql';

import { CategoryInspectionTask } from './category-inspection-task.entity';

@ObjectType()
@Table({
  tableName: 'categories',
  underscored: true,
})
export class Category extends Model<Category> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
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

  @Field({ nullable: true })
  @Column
  description?: string;

  @Field(type => [String], { nullable: true })
  @Column(DataType.ARRAY(DataType.STRING(1024)))
  includedEssentials?: string[];

  @BelongsTo(() => Category)
  parent?: Category;

  @Field(type => String, { nullable: true })
  @ForeignKey(() => Category)
  @Column(DataType.UUID)
  parentId?: string;

  @HasMany(() => Category, 'parentId')
  children!: Category[];

  @HasMany(() => CategoryInspectionTask, 'categoryId')
  inspectionTasks!: CategoryInspectionTask[];

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BeforeCreate
  static createSlug(instance: Category) {
    instance.slug = slugify(instance.name);
  }
}
