import { Injectable, Inject } from '@nestjs/common';
import { BP3D } from 'binpackingjs';
import { Inventory } from '@app/database/entities';
import { dimensions } from '@app/database/utils/dimensions';
import { unit } from 'mathjs';

const boxSizes = [
  [250.4, 250.4, 250.4],
  [304.8, 304.8, 304.8],
];

const { Item, Bin, Packer } = BP3D;

export interface Item {
  name: string;
  width: number;
  height: number;
  depth: number;
  weight: number;
  rotationType: number;
  position: number[];
}

export interface Bin {
  name: string;
  width: number;
  height: number;
  depth: number;
  maxWeight: number;
  items: Item[];
}

@Injectable()
export class PackerService {
  constructor(@Inject('SEQUELIZE') private readonly sequelize) {}

  async pack(items: Inventory[]): Promise<Bin[]> {
    let packer = new Packer();
    const packerItems = [];
    const notPackable = [];
    const bins: Bin[] = [
      new Bin('10" Box', boxSizes[0][0], boxSizes[0][1], boxSizes[0][2], 1000),
    ];

    /* eslint-disable */
    for (const item of items) {
      const [width, height, depth] = await dimensions(item.product, true);

      if (width < 304.8 && height < 304.8 && depth < 304.8) {
        packerItems.push(new Item(item.id, width, height, depth, 10));
      } else {
        notPackable.push(new Item(item.id, width, height, depth, 10));
      }
    }
    /* eslint-enable */

    bins.forEach(b => packer.addBin(b));
    packerItems.forEach(i => packer.addItem(i));

    packer.pack();

    let i = 0;
    let toggle = 1;

    while (packer.unfitItems.length && packer.bins.length < 10) {
      packer = new Packer();

      bins[i] = new Bin(
        `${toggle ? '12 Inch' : '10 Inch'} Box`,
        boxSizes[toggle][0],
        boxSizes[toggle][1],
        boxSizes[toggle][2],
        1000,
      );

      bins.forEach(b => {
        b.items = [];
        packer.addBin(b);
      });

      packerItems.forEach(i => packer.addItem(i));

      packer.pack();

      i += 1;
      toggle = toggle ? 0 : 1;
    }

    return bins.map(b => ({
      ...b,
      width: Math.round(unit(b.width, 'mm').toNumber('inch')),
      height: Math.round(unit(b.height, 'mm').toNumber('inch')),
      depth: Math.round(unit(b.depth, 'mm').toNumber('inch')),
    }));
  }
}
