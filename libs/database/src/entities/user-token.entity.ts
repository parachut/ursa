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
} from 'sequelize-typescript';
import { Field, ID, ObjectType } from 'type-graphql';

import { User } from './user.entity';

@ObjectType()
@Table({
  tableName: 'user_tokens',
  underscored: true,
})
export class UserToken extends Model<UserToken> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Column(DataType.CIDR)
  ipAddress!: string;

  @Column
  token: string;

  @Field()
  @Column
  method: string;

  @Field()
  @Column
  randomPhrase: string;

  @Field()
  @Column
  spent: boolean;

  @BelongsTo(() => User)
  user?: User;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId?: string;

  @CreatedAt
  createdAt!: Date;
}
