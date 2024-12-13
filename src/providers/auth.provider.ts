import { Request, Response, NextFunction } from 'express';
import { injectable } from 'inversify';
import { interfaces } from 'inversify-express-utils';
import AuthService from '../services/auth.service';
import container from '../setup/ioc.config';
import TYPES from '../setup/ioc.types';
import Principal from './principal.provider';

@injectable()
export default class AuthProvider implements interfaces.AuthProvider {
    private authService = container.get<AuthService>(TYPES.Services.Auth);

    private publicRoutes: Record<string, string[]> = {
        DELETE: [],
        GET: [
            '/',
        ],
        POST: [
            '/api/auth/login',
            '/api/auth/register',
        ],
        PUT: [],
        OPTIONS: [],
    };

    constructor() {
        this.setPublicOptions();
    }

    /**
     * Set public option routes based on other public routes listed
     */
    private setPublicOptions() {
        const allPublicRoutes = new Set<string>();
        const requestMethods = ['DELETE', 'GET', 'POST', 'PUT'];

        requestMethods.forEach((method) => {
            this.publicRoutes[method].forEach((route) => {
                allPublicRoutes.add(route);
            });
        });

        allPublicRoutes.forEach((route) => {
            this.publicRoutes.OPTIONS.push(route);
        });
    }

    /**
     * Set httpContext within each request to have user information from each call
     */
    public async getUser(
        req: Request,
        res: Response,
        _next: NextFunction,
    ): Promise<interfaces.Principal> {
        const isOpenPath = req.path.endsWith('open') // Not recommended practice; for review purposes only
        const isPublicPath = this.publicRoutes[req.method].includes(req.path);
        let userDetails = {};

        if (!isPublicPath && !isOpenPath) {
            try {
                const bearerToken = req.headers.authorization ?? '';
                const token = bearerToken.replace(/(bearer)/i, '').trim();
                const isTokenProvided = Boolean(token);

                if (!isTokenProvided) {
                    throw new Error('Auth token was not provided.');
                }

                userDetails = await this.authService.verifyAuthToken(token);
            } catch (e: any) {
                res.status(403).json({ error: 'Invalid token.' });
            }
        }

        return new Principal({ ...userDetails });
    }
}
