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

import { UserBankAccount } from './user-bank-account.entity';
import { User } from './user.entity';

@ObjectType()
@Table({
  tableName: 'deposits',
  underscored: true,
})
export class Deposit extends Model<Deposit> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Field()
  @Default(0)
  @Column
  amount!: number;

  @Field({ nullable: true })
  @Column
  notes?: string;

  @Field({ nullable: true })
  @Column
  plaidUrl?: string;

  @Field({ nullable: true })
  @Default(false)
  @Column
  legacy!: boolean;

  @BelongsTo(() => User, 'userId')
  user!: User;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => UserBankAccount, 'userId')
  bankAccount?: UserBankAccount;

  @ForeignKey(() => UserBankAccount)
  @Column(DataType.UUID)
  userBankAccountId!: string;

  @Field()
  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
