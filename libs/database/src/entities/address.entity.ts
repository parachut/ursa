import * as EasyPost from '@easypost/api';
import {
  AfterCreate,
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

import { Cart } from './cart.entity';
import { CensusData } from './census-data.entity';
import { Shipment } from './shipment.entity';
import { User } from './user.entity';

@ObjectType()
@Table({
  tableName: 'addresses',
  underscored: true,
})
export class Address extends Model<Address> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Field()
  @Column
  name!: string;

  @Field()
  @Column
  street!: string;

  @Field({ nullable: true })
  @Column
  street2?: string;

  @Field()
  @Column
  city!: string;

  @Field({ nullable: true })
  @Column
  county?: string;

  @Field({ nullable: true })
  @Column
  state?: string;

  @Field()
  @Column
  zip!: string;

  @Field()
  @Column
  country!: string;

  @Field()
  @Column
  formattedAddress!: string;

  @Field()
  @Column
  phone!: string;

  @Field()
  @Column
  email!: string;

  @Field()
  @Default(true)
  @Column
  residential!: boolean;

  @Field()
  @Default(true)
  @Column
  primary!: boolean;

  @Column
  easyPostId?: string;

  @Column(DataType.GEOGRAPHY('POINT'))
  coordinates: any;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => CensusData)
  censusData?: CensusData;

  @ForeignKey(() => CensusData)
  @Column(DataType.UUID)
  censusDataId?: string;

  @HasMany(() => Shipment, 'addressId')
  shipments?: Shipment[];

  @HasMany(() => Cart, 'cartId')
  carts?: Cart[];

  @CreatedAt
  createdAt!: Date;

  @DeletedAt
  deletedAt?: Date;

  @BeforeCreate
  static async normalize(instance: Address) {
    const easyPost = new EasyPost(process.env.EASYPOST);
    const { models } = instance.sequelize;

    console.log(instance);

    const user: User = (await instance.sequelize.models.User.findByPk(
      instance.userId,
    )) as User;

    if (instance.primary) {
      await models.Address.update(
        {
          primary: false,
        },
        {
          where: {
            userId: instance.userId,
          },
        },
      );
    }

    instance.country = instance.country || 'US';
    instance.email = user.email;
    instance.phone = user.phone;
    instance.name = user.name;
    instance.formattedAddress = `${instance.street} ${instance.street2}, ${instance.city}, ${instance.state} ${instance.zip}`;

    const easyPostAddress = new easyPost.Address({
      city: instance.city,
      country: instance.country,
      email: instance.email,
      phone: instance.phone,
      name: instance.name,
      state: instance.state,
      street1: instance.street,
      street2: instance.street2,
      zip: instance.zip,
    });

    await easyPostAddress.save();

    instance.residential = easyPostAddress.residential;
    instance.zip = easyPostAddress.zip;
    instance.easyPostId = easyPostAddress.id;
  }

  @AfterCreate
  static async updateCensusData(instance: Address) {
    /* integrationQueue.add(
      'update-address-census-data',
      {
        addressId: instance.get('id'),
      },
      {
        removeOnComplete: true,
        retry: 2,
      },
    ); */
  }
}
