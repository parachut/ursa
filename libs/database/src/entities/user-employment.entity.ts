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
} from 'sequelize-typescript';
import { Field, ID, ObjectType } from 'type-graphql';

import { User } from './user.entity';

@ObjectType()
@Table({
  tableName: 'user_employments',
  underscored: true,
})
export class UserEmployment extends Model<UserEmployment> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Field()
  @Column
  domain?: string;

  @Field()
  @Column
  name!: string;

  @Field()
  @Column
  title?: string;

  @Field()
  @Column
  role?: string;

  @Field()
  @Column
  subRole?: string;

  @Field()
  @Column
  senority?: string;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @CreatedAt
  createdAt!: Date;
}
