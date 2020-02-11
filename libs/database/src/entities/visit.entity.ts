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
  tableName: 'visits',
  underscored: true,
})
export class Visit extends Model<Visit> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Field()
  @Column
  deviceId!: string;

  @Field()
  @Column(DataType.CIDR)
  ipAddress!: string;

  @Column
  countryCode?: string;

  @Column
  regionCode?: string;

  @Column
  city?: string;

  @Column
  zip?: string;

  @Column(DataType.GEOGRAPHY('POINT'))
  coordinates: any;

  @Field()
  @Column
  campaign?: string;

  @Field({ nullable: true })
  @Column
  medium?: string;

  @Field()
  @Column
  source?: string;

  @BelongsTo(() => User)
  user?: User;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId?: string;

  @BelongsTo(() => User)
  affiliate?: User;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  affiliateId?: string;

  @CreatedAt
  createdAt!: Date;
}
