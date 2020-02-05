import * as EasyPost from '@easypost/api';
import {
  BeforeCreate,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  DeletedAt,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
} from 'sequelize-typescript';
import { Field, ID, ObjectType } from 'type-graphql';

import { Shipment } from './shipment.entity';
import { User } from './user.entity';

@ObjectType()
@Table({
  tableName: 'warehouses',
  underscored: true,
})
export class Warehouse extends Model<Warehouse> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Field()
  @Column
  city!: string;

  @Field()
  @Column
  country!: string;

  @Column
  easyPostId?: string;

  @Field()
  @Column
  email!: string;

  @Field()
  @Column
  phone!: string;

  @Field()
  @Column
  name!: string;

  @Field()
  @Default(false)
  @Column
  primary!: boolean;

  @Field()
  @Default(true)
  @Column
  residential!: boolean;

  @Field()
  @Column
  state!: string;

  @Field()
  @Column
  street1!: string;

  @Field({ nullable: true })
  @Column
  street2?: string;

  @Column(DataType.GEOGRAPHY('POINT'))
  coordinates: any;

  @Field()
  @Column
  zip!: string;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @HasMany(() => Shipment, 'warehouseId')
  shipments?: Shipment[];

  @CreatedAt
  createdAt!: Date;

  @DeletedAt
  deletedAt?: Date;

  @BeforeCreate
  static async createEasyPostId(instance: Warehouse) {
    const easyPost = new EasyPost(process.env.EASYPOST);

    instance.country = instance.country || 'US';

    const easyPostAddress = new easyPost.Address({
      city: instance.city,
      country: instance.country,
      email: instance.email,
      phone: instance.phone,
      state: instance.state,
      name: instance.name,
      company: instance.name,
      street1: instance.street1,
      street2: instance.street2,
      verify: ['delivery'],
      zip: instance.zip,
    });

    await easyPostAddress.save();

    if (easyPostAddress.verifications.delivery.success === false) {
      throw new Error('Address not found.');
    }

    if (
      easyPostAddress.verifications.delivery &&
      easyPostAddress.verifications.delivery.details
    ) {
      const { details } = easyPostAddress.verifications.delivery;
      const point = {
        type: 'Point',
        coordinates: [details.longitude, details.latitude],
      };
      instance.coordinates = point;
    }

    instance.residential = easyPostAddress.residential;
    instance.zip = easyPostAddress.zip;
    instance.easyPostId = easyPostAddress.id;
  }
}
