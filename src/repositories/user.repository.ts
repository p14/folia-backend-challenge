import { injectable } from 'inversify';
import { UserDocument, userSchema } from '../models/user.model';
import Repository from './_repository';

@injectable()
export default class UserRepository extends Repository<UserDocument> {
    public constructor() {
        super('users', userSchema);
    }
}
