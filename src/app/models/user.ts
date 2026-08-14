import { StrNum } from './types';
export interface IUser {
    id: StrNum;
    name: string;
}

export interface ILogin {
    username: string;
    password: string;
}

export class Login implements ILogin {
    username: string = '';
    password: string = '';
}

export interface ICurrentUser extends Partial<IUser> {
    busRouter?: [];
}

export interface IAuth {
    isLoggedIn: boolean;
    loggedInType?: number; // 1: BC, 2: Maintenance Staff
}
