import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import { Inventory } from './inventory.entity';
import { Shipment } from './shipment.entity';

@Table({
  tableName: 'shipment_inventories',
  underscored: true,
})
export class ShipmentInventory extends Model<ShipmentInventory> {
  @ForeignKey(() => Shipment)
  @Column(DataType.UUID)
  shipmentId!: string;

  @ForeignKey(() => Inventory)
  @Column(DataType.UUID)
  inventoryId!: string;
}
