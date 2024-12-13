import { UserJSON } from './user.types';

export type AuthenticatedUser = {
    token: string
    user: UserJSON
};
