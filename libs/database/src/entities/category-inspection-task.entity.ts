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
import { Field, ID, ObjectType } from 'type-graphql';

import { Category } from './category.entity';

@ObjectType()
@Table({
  tableName: 'category_inspection_tasks',
  underscored: true,
})
export class CategoryInspectionTask extends Model<CategoryInspectionTask> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.literal('uuid_generate_v4()'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Field()
  @Column
  name!: string;

  @ForeignKey(() => Category)
  @Column(DataType.UUID)
  categoryId!: string;

  @BelongsTo(() => Category)
  category!: Category;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
