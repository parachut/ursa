import fetch from 'node-fetch';
import { Op } from 'sequelize';
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
import { BP2D } from 'binpackingjs';

import { InventoryCondition } from '../enums/inventory-condition.enum';
import { InventoryStatus } from '../enums/inventory-status.enum';
import { dimensions } from '../utils/dimensions';
import { BinFreeNode } from './bin-free-node.entity';
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

  @BeforeUpdate
  static async assignBin(instance: Inventory) {
    if (instance.changed('status')) {
      if (
        instance.status === InventoryStatus.INWAREHOUSE &&
        !instance.bin &&
        !instance.changed('markedForReturn')
      ) {
        const product = await instance.$get('product');
        const user = await instance.$get('user');
        const [width, height] = await dimensions(product, false);

        const direction = product.demand > 30 ? 'DESC' : 'ASC';

        console.log(width, height);

        const freeNodes: BinFreeNode[] = (await instance.sequelize.models.BinFreeNode.findAll(
          {
            where: {
              [Op.or]: [
                {
                  width: { [Op.lte]: width },
                  height: { [Op.lte]: height },
                },
                {
                  width: { [Op.lte]: height },
                  height: { [Op.lte]: width },
                },
              ],
            },
            include: ['bin'],
            order: [['bin', 'location', direction]],
          },
        )) as BinFreeNode[];

        if (!freeNodes.length) {
          throw new Error('Unable to assign bin, create a new bin.');
        }

        const { bin } = freeNodes[0];

        instance.binId = bin.id;

        const binn = new BP2D.Bin(bin.width, bin.height);
        const contents = [];

        const binInventory = await bin.$get('inventory', {
          include: ['product'],
        });

        for (const bi of [...binInventory.map(i => i.product), product]) {
          const [width, height] = await dimensions(bi, false);
          contents.push(new BP2D.Box(width, height));
        }

        new BP2D.Packer([binn]).pack(contents);

        await instance.sequelize.models.BinFreeNode.destroy({
          where: {
            binId: bin.id,
          },
        });

        for (const freeNode of binn.freeRectangles) {
          await bin.$create('freeNode', {
            ...freeNode,
          });
        }

        const binName = `${freeNodes[0].bin.location}-${freeNodes[0].bin.row}-${freeNodes[0].bin.column}-${freeNodes[0].bin.cell}`;

        const body = {
          printerId: 69114235,
          title: 'License Plate Label for ' + instance.id,
          contentType: 'raw_base64',
          content: Buffer.from(
            `^XA

            ^FO24,48^BY0,0,0^BQN,2,7^FDMM, ${instance.id} ^FS
            
            ^FWR
            ^CF0,30
            ^FO150,260^FD ${product.name} ^FS
            ^CF0,30
            ^FO100,260^FD ${user.name} ^FS
            ^FO70,260^FD ${instance.serial} ^FS
            ^FO40,260^FD ${binName} ^FS
            
            ^XZ`,
          ).toString('base64'),
          source: 'Forest',
          expireAfter: 600,
          options: {},
        };

        const res = await fetch('https://api.printnode.com/printjobs', {
          method: 'post',
          body: JSON.stringify(body),
          headers: {
            'Content-Type': 'application/json',
            Authorization:
              'Basic ' +
              Buffer.from(
                '39duKfjG0etJ4YeQCk7WsHj2k_blwriaj9F-VPIBB5g',
              ).toString('base64'),
          },
        });

        console.log(res);
      } else {
        if (
          !instance.changed('markedForReturn') &&
          instance.status !== InventoryStatus.SHIPMENTPREP
        ) {
          instance.binId = null;
        }
      }
    }
  }
}
