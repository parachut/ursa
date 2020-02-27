import nameParser from 'another-name-parser';
import {
  AfterCreate,
  AfterUpdate,
  BeforeCreate,
  Column,
  CreatedAt,
  DataType,
  Default,
  DeletedAt,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique,
  Sequelize,
  UpdatedAt,
  HasOne,
} from 'sequelize-typescript';
import { Field, ID, Int, ObjectType } from 'type-graphql';

import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';
import { Address } from './address.entity';
import { BillingInfo } from './billing-info.entity';
import { Cart } from './cart.entity';
import { Deposit } from './deposit.entity';
import { Income } from './income.entity';
import { Inventory } from './inventory.entity';
import { Queue } from './queue.entity';
import { ShipKit } from './ship-kit.entity';
import { Subscription } from './subscription.entity';
import { Shipment } from './shipment.entity';
import { UserBankAccount } from './user-bank-account.entity';
import { UserBankBalance } from './user-bank-balance.entity';
import { UserGeolocation } from './user-geolocation.entity';
import { UserIntegration } from './user-integration.entity';
import { UserMarketingSource } from './user-marketing-source.entity';
import { UserSocialHandle } from './user-social-handle.entity';
import { UserTermAgreement } from './user-term-agreement.entity';
import { UserVerification } from './user-verification.entity';
import { createAuthyUser } from '../utils/create-authy-user';
import { createRecurlyUser } from '../utils/create-recurly-user';
import { createFrontContact } from '../utils/create-front-contact';
import checkClearbit from '../utils/check-clearbit';
import { UserFunds } from './user-funds.view';
import { AffiliateStats } from './affiliate-stats.view';

@ObjectType()
@Table({
  tableName: 'users',
  underscored: true,
})
export class User extends Model<User> {
  @Field(type => ID)
  @PrimaryKey
  @Default(Sequelize.fn('uuid_generate_v4'))
  @Column(DataType.UUID)
  readonly id!: string;

  @Field({ nullable: true })
  @Column
  avatar?: string;

  @Field({ nullable: true })
  @Column
  bio?: string;

  @Field(type => Int)
  @Default(1)
  @Column(DataType.SMALLINT)
  billingHour!: number;

  @Field(type => Int, { nullable: true })
  @Column(DataType.SMALLINT)
  billingDay?: number;

  @Field({ nullable: true })
  @Column
  businessName?: string;

  @Field(type => Int)
  @Default(0)
  @Column
  contributorStep!: number;

  @Field()
  @Unique
  @Column
  email!: string;

  @Field({ nullable: true })
  @Column
  location?: string;

  @Field()
  @Unique
  @Column
  phone!: string;

  @Field()
  @Column
  name!: string;

  @Column(DataType.JSONB)
  parsedName?: any;

  @Field({ nullable: true })
  @Column
  planId?: string;

  @Field(type => Int)
  @Default(0)
  @Column
  points!: number;

  @Field(type => [UserRole])
  @Default([UserRole.MEMBER])
  @Column(
    DataType.ARRAY(
      DataType.ENUM({
        values: Object.values(UserRole),
      }),
    ),
  )
  roles!: UserRole[];

  @Field(type => UserStatus)
  @Default(UserStatus.APPROVED)
  @Column(
    DataType.ENUM({
      values: Object.values(UserStatus),
    }),
  )
  status!: UserStatus;

  @Field()
  @Column
  site?: string;

  @Field()
  @Column
  stripeId?: string;

  @Field()
  @Default(false)
  @Column
  protectionPlan!: boolean;

  @Field({ nullable: true })
  @Column
  legacyPlan?: string;

  @Field({ nullable: true })
  @Column
  additionalItems?: number;

  @Field()
  @Default(false)
  @Column
  vip!: boolean;

  @HasMany(() => Cart, 'userId')
  carts!: Cart[];

  @HasMany(() => Address, 'userId')
  addresses!: Address[];

  @HasMany(() => Deposit, 'userId')
  deposits!: Deposit[];

  @HasMany(() => Income, 'userId')
  incomes!: Income[];

  @HasMany(() => Income, 'memberId')
  linkedIncomes!: Income[];

  @HasMany(() => UserIntegration, 'userId')
  integrations!: UserIntegration[];

  @HasMany(() => UserVerification, 'userId')
  verifications!: UserVerification[];

  @HasMany(() => UserMarketingSource, 'userId')
  marketingSources!: UserMarketingSource[];

  @HasMany(() => UserSocialHandle, 'userId')
  socialHandles!: UserSocialHandle[];

  @HasMany(() => UserGeolocation, 'userId')
  geolocations!: UserGeolocation[];

  @Field(type => [Inventory])
  @HasMany(() => Inventory, 'memberId')
  currentInventory: Inventory[];

  @Field(type => [Inventory])
  @HasMany(() => Inventory, 'userId')
  inventory: Inventory[];

  @HasMany(() => Queue, 'userId')
  queues?: Queue[];

  @HasMany(() => ShipKit, 'userId')
  shipKits?: ShipKit[];

  @HasMany(() => Shipment, 'userId')
  shipments?: Shipment[];

  @HasMany(() => UserBankAccount, 'userId')
  bankAccounts?: UserBankAccount[];

  @HasMany(() => UserBankBalance, 'userId')
  bankBalances?: UserBankBalance[];

  @HasOne(() => UserFunds, 'userId')
  funds?: UserFunds;

  @HasOne(() => AffiliateStats, 'userId')
  affiliateStats?: AffiliateStats;

  @HasMany(() => UserTermAgreement, 'userId')
  termAgreements?: UserTermAgreement[];

  @HasOne(() => Subscription, 'userId')
  subscription?: Subscription;

  @HasOne(() => BillingInfo, 'userId')
  billingInfo?: BillingInfo;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt?: Date;

  @DeletedAt
  deletedAt?: Date;

  @BeforeCreate
  static parseName(instance: User) {
    instance.parsedName = nameParser(instance.name);
  }

  @AfterCreate
  static async linkAccounts(instance: User) {
    const integrations = await Promise.all([
      createAuthyUser(instance),
      createRecurlyUser(instance),
      createFrontContact(instance),
    ]);
    await Promise.all([
      instance.sequelize.models.UserIntegration.bulkCreate(integrations),
      checkClearbit(instance),
    ]);
  }

  @AfterUpdate
  static async updateAuthy(instance: User) {
    if (instance.changed('phone')) {
      const newAuthy = await createAuthyUser(instance);
      await instance.sequelize.models.UserIntegration.destroy({
        where: {
          userId: instance.id,
          type: 'AUTHY',
        },
      });
      await instance.$create('integrations', newAuthy);
    }
  }
}
