declare module 'authy-client';
declare module '@easypost/api';
import * as admin from 'firebase-admin';

declare module 'express-serve-static-core' {
  interface Request {
    firebaseUser: admin.auth.DecodedIdToken;
  }
}
