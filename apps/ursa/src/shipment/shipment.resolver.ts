import { Inventory, Shipment, User } from '@app/database/entities';
import { Logger, UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveProperty,
  Resolver,
} from '@nestjs/graphql';

import { CurrentUser } from '../current-user.decorator';
import { GqlAuthGuard } from '../gql-auth.guard';
import { ShipmentCreateInput } from './dto/shipment-create.input';
import { ShipmentService } from './shipment.service';
import { ShipmentType } from '@app/database/enums';
import { ShipmentTracker } from '@app/database/types/shipment-tracker.type';

@Resolver(of => Shipment)
export class ShipmentResolver {
  private readonly logger = new Logger(ShipmentResolver.name);

  constructor(private readonly shipmentService: ShipmentService) {}

  @Query(type => Shipment)
  @UseGuards(GqlAuthGuard)
  async shipment(
    @Args('id') id: string,
    @CurrentUser() user: User,
  ): Promise<Shipment> {
    return this.shipmentService.findOne(id, user.id);
  }

  @Query(returns => [Shipment])
  @UseGuards(GqlAuthGuard)
  async shipments(@CurrentUser() user: User): Promise<Shipment[]> {
    return this.shipmentService.find(user.id);
  }

  @Mutation(returns => Shipment)
  @UseGuards(GqlAuthGuard)
  async shipmentCreate(
    @Args('input')
    input: ShipmentCreateInput,
    @CurrentUser() user: User,
  ): Promise<Shipment> {
    return this.shipmentService.create(input, user.id);
  }

  @ResolveProperty(type => [Inventory])
  async inventory(@Parent() shipment: Shipment): Promise<Inventory[]> {
    return shipment.$get('inventory');
  }
}
