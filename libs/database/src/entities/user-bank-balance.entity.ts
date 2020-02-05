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

import { User } from './user.entity';

@Table({
  tableName: 'user_bank_balances',
  underscored: true,
})
export class UserBankBalance extends Model<UserBankBalance> {
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Column
  available?: number;

  @Column
  name!: string;

  @Column
  limit?: number;

  @Column
  current!: number;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @CreatedAt
  createdAt!: Date;
}
