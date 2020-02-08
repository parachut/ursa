import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  PrimaryKey,
} from 'sequelize-typescript';
import { Field, ObjectType } from 'type-graphql';

import { User } from './user.entity';

@ObjectType()
@Table({
  tableName: 'user_funds',
  underscored: true,
  timestamps: false,
})
export class UserFunds extends Model<UserFunds> {
  @Field()
  @Column(DataType.REAL)
  balance!: number;

  @Field()
  @Column(DataType.REAL)
  total!: number;

  @Field()
  @Column(DataType.REAL)
  withdrawn!: number;

  @BelongsTo(() => User)
  user!: User;

  @PrimaryKey
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;
}
