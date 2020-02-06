import { registerEnumType } from 'type-graphql';

export enum AuthenticateMethod {
  CALL = 'CALL',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
}

registerEnumType(AuthenticateMethod, {
  name: 'AuthenticateMethod',
});
