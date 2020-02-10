require('dotenv').config();
import { Injectable } from '@nestjs/common';



@Injectable()
export class AuthService {
    async validateUser(username: string, password: string): Promise<any> {
        const user = {

            username: process.env.USERNAME,
            password: process.env.PASSWORD
        }
        if (username === user.username && user.password === password) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
}