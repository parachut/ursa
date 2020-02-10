import { createParamDecorator } from '@nestjs/common';
import PhoneNumber from 'awesome-phonenumber';

export const Phone = createParamDecorator((data, [root, args, ctx, info]) => {
  if (args.input.phone && !args.input.phone.startsWith('+')) {
    const pn = new PhoneNumber(args.input.phone, 'US');

    if (!pn.isValid()) {
      throw new Error('Phone number is not valid.');
    }

    const phone = pn.getNumber();

    return phone;
  }

  return args.input.phone;
});
