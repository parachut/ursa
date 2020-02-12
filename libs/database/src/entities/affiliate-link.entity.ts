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
import { AffiliateLinkType } from '../enums';

import { User } from './user.entity';

@ObjectType()
@Table({
  tableName: 'affiliate_links',
  underscored: true,
})
export class AffiliateLink extends Model<AffiliateLink> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Field()
  @Unique
  @Column
  link!: string;

  @Field()
  @Column
  rebrandlyId!: string;

  @Field(type => AffiliateLinkType)
  @Default(AffiliateLinkType.ACCESS)
  @Column(
    DataType.ENUM({
      values: Object.values(AffiliateLinkType),
    }),
  )
  type!: AffiliateLinkType;

  @BelongsTo(() => User)
  user?: User;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId?: string;

  @CreatedAt
  createdAt!: Date;
}
