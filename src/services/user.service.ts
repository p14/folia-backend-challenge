import { inject, injectable } from 'inversify';
import { Types } from 'mongoose';
import { User, UserDocument } from '../models/user.model';
import UserRepository from '../repositories/user.repository';
import TYPES from '../setup/ioc.types';

@injectable()
export default class UserService {
    private userRepository: UserRepository;

    constructor(
        @inject(TYPES.Repositories.User) userRepository: UserRepository,
    ) {
        this.userRepository = userRepository;
    }

    /**
     * Creates a new user
     * @param {User} user
     * @returns {Promise<UserDocument>}
     */
    public async createUser(
        user: User,
    ): Promise<UserDocument> {
        const UserModel = this.userRepository.getModel();
        const newUser = new UserModel(user);
        await newUser.save();

        return newUser;
    }

    /**
     * Gets a user from the database
     * @param {Types.ObjectId} id 
     * @returns {Promise<UserDocument>}
     */
    public async getUser(
        id: Types.ObjectId,
    ): Promise<UserDocument> {
        const user = await this.userRepository.findOne({ _id: id });

        if (!user) {
            throw new Error('User not found.');
        }

        return user;
    }

    public async getUserByEmail(
        email: string,
    ): Promise<UserDocument | null> {
        return this.userRepository.findOne({ email });
    }

    /**
     * Updates a user in the database and retrieves the updated document
     * @param {Types.ObjectId} id
     * @param {Partial<User>} user
     * @returns {Promise<UserDocument>}
     */
    public async updateUser(
        id: Types.ObjectId,
        user: Partial<User>,
    ): Promise<UserDocument> {
        const updatedUser = await this.userRepository.findOneAndUpdate({ _id: id }, { $set: user });

        if (!updatedUser) {
            throw new Error('User not found.');
        }

        return updatedUser;
    }

    /**
     * Deletes a user from the database
     * @param {Types.ObjectId} id
     * @returns {Promise<DeleteResult>}
     */
    public async deleteUser(
        id: Types.ObjectId,
    ): Promise<{ acknowledged: boolean; deletedCount: number }> {
        const deleteData = await this.userRepository.deleteOne({ _id: id });

        if (!deleteData.deletedCount) {
            throw new Error('User not found.');
        }

        return deleteData;
    }
}
