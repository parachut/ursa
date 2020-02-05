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
  tableName: 'user_bank_accounts',
  underscored: true,
})
export class UserBankAccount extends Model<UserBankAccount> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Column
  accountId!: string;

  @Field()
  @Default(false)
  @Column
  primary!: boolean;

  @Field()
  @Column
  mask!: string;

  @Field()
  @Column
  name!: string;

  @Column
  subtype!: string;

  @Column
  plaidUrl!: string;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @CreatedAt
  createdAt!: Date;
}
