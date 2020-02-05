import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
} from 'sequelize-typescript';

import { CensusData } from './census-data.entity';

@Table({
  tableName: 'census_range_blocks',
  underscored: true,
})
export class CensusRangeBlock extends Model<CensusRangeBlock> {
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Column(DataType.RANGE(DataType.INTEGER))
  range!: [number];

  @Column(DataType.FLOAT)
  value!: number;

  @Column(DataType.GEOGRAPHY('POINT'))
  coordinates: any;

  @BelongsTo(() => CensusData)
  censusDataAge?: CensusData;

  @ForeignKey(() => CensusData)
  @Column(DataType.UUID)
  censusDataAgeId?: string;

  @BelongsTo(() => CensusData)
  censusDataIncome?: CensusData;

  @ForeignKey(() => CensusData)
  @Column(DataType.UUID)
  censusDataIncomeId?: string;

  @CreatedAt
  createdAt!: Date;
}
