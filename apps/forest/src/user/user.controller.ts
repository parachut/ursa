import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LogInAsService } from './loginas.service';
import { LoginAsDto } from './dto/login-as.dto';
import { sign } from 'jsonwebtoken';
import { ShipmentDirection, ShipmentType } from '@app/database/enums';
import { Shipment } from '@app/database/entities';
import { EmailService } from './email.service';

const plans = {
  '1500': 149,
  '3500': 349,
  '750': 99,
  '7500': 499,
  'level-1': 249,
  'level-2': 399,
  'level-3': 499,
};

const planName = {
  'level-1': 'Level 1',
  'level-2': 'Level 2',
  'level-3': 'Level 3',
};

@Controller()
export class UserController {
  constructor(
    private readonly loginasService: LogInAsService,
    private readonly emailService: EmailService, ) { }

  @UseGuards(AuthGuard('jwt'))
  @Post('/actions/login-as')
  async loginAs(@Body() loginAsDto: LoginAsDto) {
    const { ids } = loginAsDto.data.attributes;

    const user = await this.loginasService.findUser(ids[0]);

    const token = sign(
      {
        sub: user.id,
        roles: user.roles,
      },
      'ysGEMzVN6MPbKTWXhuPt3dtwoE8GRJiCDNkctvUqZBUouhRq-Y',
    );
    return {
      success: 'Generated token success.',
      redirectTo:
        'https://www.parachut.co/?temp_token=' + encodeURIComponent(token),
    };
  }
 

  @UseGuards(AuthGuard('jwt'))
  @Post('/actions/confirm-cart')
  async confirmCart(@Body() loginAsDto: LoginAsDto) {
    const { ids } = loginAsDto.data.attributes;

    const carts = await this.loginasService.findCarts(ids);

    for (const cart of carts) {
      cart.confirmedAt = new Date();

      await cart.save();

      const total = cart.user.currentInventory.reduce(
        (r, i) => r + i.product.points,
        0,
      );

      const shipment = await cart.$create<Shipment>('shipment', {
        direction: ShipmentDirection.OUTBOUND,
        expedited: cart.service !== 'Ground',
        type: ShipmentType.ACCESS,
      });

      await this.emailService.send({
        to: cart.user.email,
        from: 'support@parachut.co',
        id: 12931487,
        data: {
          purchase_date: new Date().toDateString(),
          name: cart.user.name,
          chutItems: cart.items.map(item => ({
            image: item.product.images.length
              ? `https://parachut.imgix.net/${item.product.images[0]}`
              : '',
            name: item.product.name,
            points: item.product.points,
          })),
          planId: cart.planId,
          monthly: plans[cart.planId],
          pointsOver: Math.max(0, total - Number(cart.planId)),
          overage: Math.max(0, total - Number(cart.planId)) * 0.1,
          protectionPlan: cart.protectionPlan,
          totalMonthly: total + Math.max(0, total - Number(cart.planId)) * 0.1,
          availablePoints: cart.user.points - total,
          cartPoints: cart.items.reduce((r, i) => r + i.points, 0),
        },
      });

      await shipment.$set(
        'inventory',
        cart.inventory.map(item => item.id),
      );
    }

    return {
      success: 'Cart(s) are confirmed!',
    };
  }

}
