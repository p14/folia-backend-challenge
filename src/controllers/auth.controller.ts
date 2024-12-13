import { Request } from 'express';
import { inject } from 'inversify';
import { BaseHttpController, controller, httpPost, request } from 'inversify-express-utils';
import { User } from '../models/user.model';
import TYPES from '../setup/ioc.types';
import AuthService from '../services/auth.service';

@controller(TYPES.Namespace.Auth, TYPES.Middleware.Validation)
export default class AuthController extends BaseHttpController {
    private authService: AuthService;

    constructor(
        @inject(TYPES.Services.Auth) authService: AuthService,
    ) {
        super();
        this.authService = authService;
    }

    @httpPost('/register')
    public async registerUser(
        @request() req: Request,
    ) {
        try {
            const user: User = { ...req.body };

            // Create the new subscription
            const newUser = await this.authService.registerUser(user);
            return this.json(newUser, 200);
        } catch (e: any) {
            console.error(e.message);
            return this.json({ error: e.message }, 500);
        }
    }

    @httpPost('/login')
    public async logInUser(
        @request() req: Request,
    ) {
        try {
            const { email, password }: { email: string, password: string } = req.body;

            // Get the requested user
            const user = await this.authService.logInUser(email, password);
            return this.json(user, 200);
        } catch (e: any) {
            console.error(e.message);
            return this.json({ error: e.message }, 500);
        }
    }
}
