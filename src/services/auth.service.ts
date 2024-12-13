import { inject, injectable } from 'inversify';
import jwt from 'jsonwebtoken';
import { mongo } from 'mongoose';
import { User } from '../models/user.model';
import TYPES from '../setup/ioc.types';
import UserService from './user.service';
import { AuthenticatedUser } from '../types/auth.types';
import { UserJSON } from '../types/user.types';

@injectable()
export default class AuthService {
    private userService: UserService;

    constructor(
        @inject(TYPES.Services.User) userService: UserService,
    ) {
        this.userService = userService;
    }

    /**
     * Register a new user and log in
     * @param {User} user
     * @returns {Promise<AuthenticatedUser>}
     */
    public async registerUser(
        user: User,
    ): Promise<AuthenticatedUser> {
        console.log('hit')
        await this.userService.createUser(user);
        return this.logInUser(user.email, user.password);
    }

    /**
     * Login a user with by email and password
     * @param {string} email
     * @param {string} password
     * @returns {Promise<AuthenticatedUser>}
     */
    public async logInUser(
        email: string,
        password: string,
    ): Promise<AuthenticatedUser> {
        // Verify user with this email exists
        const user = await this.userService.getUserByEmail(email);

        if (!user) {
            throw new Error('Invalid email or password.');
        }

        // Verify password is correct
        const matchingPassword = await user.comparePassword(password);

        if (!matchingPassword) {
            throw new Error('Invalid email or password.');
        }

        // Create JWT
        const token = AuthService.generateAuthToken(String(user._id));
        return { user: user.toJSON(), token };
    }

    /**
     * Creates an auth token with the userId
     * NOTE: This is not a recommended implementation of auth, this is
     *       is for speed to highlight the reminder implementation and
     *       features per the specs of the assessment.
     * @param {string} userId
     * @returns {string}
     */
    private static generateAuthToken(
        userId: string,
    ): string {
        return jwt.sign({ userId }, String(process.env.SECRET_KEY));
    }

    /**
     * Validates the token against the JWT secret
     * @param {string} token
     * @returns {string | jwt.JwtPayload}
     */
    public async verifyAuthToken(
        token: string,
    ): Promise<UserJSON> {
        const payload = jwt.verify(token, String(process.env.SECRET_KEY)) as { userId: string };
        const user = await this.userService.getUser(new mongo.ObjectId(payload.userId));
        return user.toJSON();
    }
}
