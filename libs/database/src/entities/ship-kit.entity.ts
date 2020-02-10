import * as pMap from 'p-map';
import {
  AfterUpdate,
  BelongsTo,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { Field, ID, ObjectType } from 'type-graphql';

import { InventoryStatus } from '../enums/inventory-status.enum';
import { ShipmentDirection } from '../enums/shipment-direction.enum';
import { ShipmentType } from '../enums/shipment-type.enum';
import { Address } from './address.entity';
import { Inventory } from './inventory.entity';
import { ShipKitInventory } from './ship-kit-inventory.entity';
import { Shipment } from './shipment.entity';
import { User } from './user.entity';

@ObjectType()
@Table({
  tableName: 'shipkits',
  underscored: true,
})
export class ShipKit extends Model<ShipKit> {
  /**
   * ID
   */
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.literal('uuid_generate_v4()'))
  @Column(DataType.UUID)
  readonly id!: string;

  /**
   * Database Fields
   */
  @Field({ nullable: true })
  @Column
  completedAt?: Date;

  @Field({ nullable: true })
  @Column
  confirmedAt?: Date;

  @Field()
  @Default(true)
  @Column
  airbox!: boolean;

  /**
   * Database Relationships
   */
  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => Address)
  address?: Address;

  @ForeignKey(() => Address)
  @Column(DataType.UUID)
  addressId?: string;

  @HasMany(() => Shipment, 'shipKitId')
  shipments: Shipment[];

  @BelongsToMany(
    () => Inventory,
    () => ShipKitInventory,
  )
  inventory: Inventory[];

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @AfterUpdate
  static async updateInventory(instance: ShipKit) {
    if (instance.changed('completedAt') && !instance.confirmedAt) {
      const { models } = instance.sequelize;

      const inventory = (await models.Inventory.findAll({
        where: {
          userId: instance.userId,
          status: InventoryStatus.NEW,
        },
        include: ['product'],
      })) as Inventory[];

      const shipments: any[] = [];

      let airboxShipment: Shipment = null;

      if (instance.airbox) {
        airboxShipment = new models.Shipment({
          addressId: instance.addressId,
          userId: instance.userId,
          airbox: true,
          expedited: false,
          direction: ShipmentDirection.OUTBOUND,
          type: ShipmentType.EARN,
          shipKitId: instance.id,
        }) as Shipment;

        shipments.push(airboxShipment);
      }

      const returnShipment = new models.Shipment({
        addressId: instance.addressId,
        userId: instance.userId,
        airbox: true,
        expedited: false,
        direction: ShipmentDirection.INBOUND,
        type: ShipmentType.EARN,
        shipKitId: instance.id,
      }) as Shipment;

      shipments.push(returnShipment);

      await pMap(shipments, s => s.save(), {
        concurrency: 2,
      });

      await pMap(
        shipments,
        s =>
          s.$set(
            'inventory',
            inventory.map(i => i.id),
          ),
        {
          concurrency: 2,
        },
      );

      inventory.forEach(i => {
        i.status = InventoryStatus.ACCEPTED;
      });

      await pMap(inventory, i => i.save(), {
        concurrency: 2,
      });

      await instance.$set(
        'inventory',
        inventory.map(i => i.id),
      );

      instance.confirmedAt = new Date();

      await instance.save();
    }
  }
}
