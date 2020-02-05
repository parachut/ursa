import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import { Inventory } from './inventory.entity';
import { ShipKit } from './ship-kit.entity';

@Table({
  tableName: 'shipkit_inventories',
  underscored: true,
})
export class ShipKitInventory extends Model<ShipKitInventory> {
  @ForeignKey(() => ShipKit)
  @Column(DataType.UUID)
  shipKitId!: string;

  @ForeignKey(() => Inventory)
  @Column(DataType.UUID)
  inventoryId!: string;
}
