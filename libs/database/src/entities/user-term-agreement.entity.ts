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
  tableName: 'user_term_agreements',
  underscored: true,
})
export class UserTermAgreement extends Model<UserTermAgreement> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Field()
  @Column
  type!: string;

  @Field()
  @Column
  agreed!: boolean;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @Field()
  @CreatedAt
  createdAt!: Date;
}
