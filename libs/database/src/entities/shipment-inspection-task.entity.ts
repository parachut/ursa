import {
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { Field, ID } from 'type-graphql';

import { CategoryInspectionTask } from './category-inspection-task.entity';
import { ShipmentInspection } from './shipment-inspection.entity';

@Table({
  tableName: 'shipment_inspection_tasks',
  underscored: true,
})
export class ShipmentInspectionTask extends Model<ShipmentInspectionTask> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @ForeignKey(() => CategoryInspectionTask)
  @Column(DataType.UUID)
  categoryInspectionTaskId!: string;

  @ForeignKey(() => ShipmentInspection)
  @Column(DataType.UUID)
  shipmentInspectionId!: string;

  @Column(DataType.BOOLEAN)
  complete!: boolean;

  @Column(DataType.TEXT)
  notes?: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
