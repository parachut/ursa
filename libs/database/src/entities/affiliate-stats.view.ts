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
  tableName: 'affiliate_stats',
  underscored: true,
  timestamps: false,
})
export class AffiliateStats extends Model<AffiliateStats> {
  @Field()
  @Column(DataType.REAL)
  clicks!: number;

  @Field()
  @Column(DataType.REAL)
  accessClicks!: number;

  @Field()
  @Column(DataType.REAL)
  earnClicks!: number;

  @Field()
  @Column(DataType.REAL)
  earnSignups!: number;

  @Field()
  @Column(DataType.REAL)
  accessSignups!: number;

  @Field()
  @Column(DataType.REAL)
  newMemberships!: number;

  @Field()
  @Column(DataType.REAL)
  newShipKits!: number;

  @BelongsTo(() => User)
  user!: User;

  @PrimaryKey
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;
}
