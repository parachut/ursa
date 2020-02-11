import {
  AfterCreate,
  AfterUpdate,
  BeforeCreate,
  BeforeUpdate,
  BelongsTo,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { Field, Float, ID, ObjectType } from 'type-graphql';

import { InventoryCondition } from '../enums/inventory-condition.enum';
import { InventoryStatus } from '../enums/inventory-status.enum';
import { Bin } from './bin.entity';
import { CartInventory } from './cart-inventory.entity';
import { Cart } from './cart.entity';
import { Income } from './income.entity';
import { InventoryIncome } from './inventory-incomes.view';
import { Product } from './product.entity';
import { ShipmentInspection } from './shipment-inspection.entity';
import { ShipmentInventory } from './shipment-inventory.entity';
import { Shipment } from './shipment.entity';
import { User } from './user.entity';
import { Warehouse } from './warehouse.entity';

@ObjectType()
@Table({
  tableName: 'inventories',
  underscored: true,
})
export class Inventory extends Model<Inventory> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.literal('uuid_generate_v4()'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Default(true)
  @Column
  active!: boolean;

  @Field(type => InventoryCondition)
  @Default(InventoryCondition.NEW)
  @Column(
    DataType.ENUM({
      values: Object.values(InventoryCondition),
    }),
  )
  condition!: InventoryCondition;

  @Default(true)
  @Column
  hasEssentials!: boolean;

  @Field({ nullable: true })
  @Default(false)
  @Column
  markedForReturn?: boolean;

  @Default([])
  @Column(DataType.ARRAY(DataType.STRING(1024)))
  images?: string[];

  @Field(type => Float)
  @Column(DataType.REAL)
  commission!: number;

  @Field(type => [String])
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING(1024)))
  missingEssentials!: string[];

  @Field({ nullable: true })
  @Column
  serial?: string;

  @Column
  sku?: string;

  @Field(type => InventoryStatus)
  @Default(InventoryStatus.NEW)
  @Column(
    DataType.ENUM({
      values: Object.values(InventoryStatus),
    }),
  )
  status!: InventoryStatus;

  @BelongsToMany(
    () => Shipment,
    () => ShipmentInventory,
  )
  shipments: Shipment[];

  @BelongsToMany(
    () => Cart,
    () => CartInventory,
  )
  carts: Cart[];

  @BelongsTo(() => Bin)
  bin: Bin;

  @ForeignKey(() => Bin)
  @Column(DataType.UUID)
  binId!: string;

  @BelongsTo(() => Product)
  product: Product;

  @ForeignKey(() => Product)
  @Column(DataType.UUID)
  productId!: string;

  @BelongsTo(() => User, 'userId')
  user!: User;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User, 'memberId')
  member!: User;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  memberId!: string;

  @BelongsTo(() => Warehouse)
  warehouse!: Warehouse;

  @ForeignKey(() => Warehouse)
  @Column(DataType.UUID)
  warehouseId!: string;

  @HasMany(() => ShipmentInspection, 'inventoryId')
  inspections?: ShipmentInspection[];

  @HasMany(() => Income, 'inventoryId')
  incomes?: Income[];

  @HasOne(() => InventoryIncome, 'inventoryId')
  income?: InventoryIncome;

  @Field(() => Date)
  @CreatedAt
  createdAt!: Date;

  @Field(() => Date)
  @UpdatedAt
  updatedAt!: Date;

  @AfterUpdate
  @AfterCreate
  static async updateProductStock(instance: Inventory, options: any) {
    if (instance.changed('status')) {
      const { models } = instance.sequelize;

      const stock = await models.Inventory.count({
        where: {
          productId: instance.productId,
          status: InventoryStatus.INWAREHOUSE,
        },
      });

      await models.Product.update(
        {
          stock,
        },
        {
          where: {
            id: instance.productId,
          },
          individualHooks: true,
        },
      );
    }
  }

  @BeforeCreate
  static async setCommission(instance: Inventory) {
    const product = await instance.$get('product');
    instance.commission = Number(
      (
        ((product.points * 0.7) / 30.1) *
        (parseInt(process.env.CONTRIBUTOR_PERCENT) / 100)
      ).toFixed(2),
    );
  }
}
