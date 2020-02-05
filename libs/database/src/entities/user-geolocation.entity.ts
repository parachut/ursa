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
  tableName: 'user_geolocations',
  underscored: true,
})
export class UserGeolocation extends Model<UserGeolocation> {
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Column(DataType.CIDR)
  ip!: string;

  @Column
  type!: string;

  @Column
  countryCode!: string;

  @Column
  regionCode?: string;

  @Column
  city?: string;

  @Column
  zip?: string;

  @Column(DataType.GEOGRAPHY('POINT'))
  coordinates: any;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @CreatedAt
  createdAt!: Date;
}
