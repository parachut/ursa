import {
  Column,
  CreatedAt,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
} from 'sequelize-typescript';

import { Address } from './address.entity';
import { CensusRangeBlock } from './census-range-block.entity';

@Table({
  tableName: 'census_datas',
  underscored: true,
})
export class CensusData extends Model<CensusData> {
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Column
  fips!: string;

  @Column
  medianAge!: number;

  @Column
  medianIncome!: number;

  @Column
  medianHouseValue!: number;

  @Column
  vacantHousing!: number;

  @Column
  highSchoolGraduate!: number;

  @Column
  someCollege!: number;

  @Column
  collegeGraduate!: number;

  @Column
  mastersGraduate!: number;

  @Column
  professionalGraduate!: number;

  @Column
  doctorateGraduate!: number;

  @Column
  populationTotal!: number;

  @HasMany(() => CensusRangeBlock, 'censusDataAgeId')
  ageRanges!: CensusRangeBlock[];

  @HasMany(() => CensusRangeBlock, 'censusDataIncomeId')
  incomeRanges!: CensusRangeBlock[];

  @HasMany(() => Address, 'censusDataId')
  addresses!: Address[];

  @CreatedAt
  createdAt!: Date;
}
