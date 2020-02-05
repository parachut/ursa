import {
  BelongsTo,
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

import { InventoryCondition } from '../enums/inventory-condition.enum';
import { File } from './file.entity';
import { Inventory } from './inventory.entity';
import { Shipment } from './shipment.entity';
import { ShipmentInspectionTask } from './shipment-inspection-task.entity';
import { User } from './user.entity';

@ObjectType()
@Table({
  tableName: 'shipment_inspections',
  underscored: true,
})
export class ShipmentInspection extends Model<ShipmentInspection> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Field(type => InventoryCondition)
  @Default(InventoryCondition.NEW)
  @Column(
    DataType.ENUM({
      values: Object.values(InventoryCondition),
    }),
  )
  condition!: InventoryCondition;

  @Field()
  @Default(true)
  @Column
  hasEssentials!: boolean;

  @Field(type => [String])
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING(1024)))
  missingEssentials!: string[];

  @Field(type => [String])
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING(1024)))
  images!: string[];

  @Field({ nullable: true })
  @Column
  notes?: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => Inventory)
  @Column(DataType.UUID)
  inventoryId!: string;

  @BelongsTo(() => Inventory)
  inventory!: Inventory;

  @ForeignKey(() => Shipment)
  @Column(DataType.UUID)
  shipmentId!: string;

  @BelongsTo(() => Shipment)
  shipment!: Shipment;

  @HasMany(() => File, 'shipmentInspectionId')
  file?: File;

  @HasMany(() => ShipmentInspectionTask, 'shipmentInspectionId')
  tasks?: [ShipmentInspectionTask];

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
