import { UserRole } from '@app/database/enums/user-role.enum';
import { Request, Response } from 'express';

export type JWTPayLoad = {
  id: string;
  roles: UserRole[];
};

export interface Context {
  clientIp: string;
  user?: JWTPayLoad;
  req: Request;
  res: Response;
  connection: any;
}
