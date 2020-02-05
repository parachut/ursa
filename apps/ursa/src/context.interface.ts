import { UserRole } from '@app/database/enums/user-role.enum';
import { Request } from 'express';

export type JWTPayLoad = {
  id: string;
  roles: UserRole[];
};

export interface Context {
  clientIp: string;
  user?: JWTPayLoad;
  req: Request;
}
