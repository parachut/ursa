require('dotenv').config();
import { Injectable } from '@nestjs/common';



@Injectable()
export class AuthService {
    async validateUser(username: string, password: string): Promise<any> {
        const user = {
            id: 1,
            username: process.env.USERNAME,
            password: process.env.PASSWORD
        }
        // const user = await this.usersService.findOne(username);
        if (username === user.username && user.password === password) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
}