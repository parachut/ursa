import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import { Inventory } from './inventory.entity';
import { Return } from './return.entity';

@Table({
  tableName: 'return_inventories',
  underscored: true,
})
export class ReturnInventory extends Model<ReturnInventory> {
  @ForeignKey(() => Return)
  @Column(DataType.UUID)
  returnId!: string;

  @ForeignKey(() => Inventory)
  @Column(DataType.UUID)
  inventoryId!: string;
}
