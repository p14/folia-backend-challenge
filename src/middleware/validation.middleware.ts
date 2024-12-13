import { Request, Response, NextFunction } from "express";
import { injectable } from "inversify";
import { BaseMiddleware } from "inversify-express-utils";
import { getBasePath, isValidationRequestMethod, parseValidationError } from "./validation/validation.helpers";
import { GetSchemasRequest, ValidateSchemaRequest, ValidationObjectSchemas } from "./validation/validation.types";
import validationRegistry from "./validation/validators/_register.validators";

@injectable()
export default class ValidationMiddleware extends BaseMiddleware {
    constructor() {
        super();
    }

    public async handler(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const {
                body,
                method,
                params,
                route: { path },
                query,
            } = req;

            // Check method and assert method type
            if (!isValidationRequestMethod(method)) {
                return res.status(400).json({ error: 'Request method cannot be validated.' });
            }

            //  Get validation schemas
            const validationSchemas = ValidationMiddleware.getSchemas({ method, path });

            // Skip validation if a schema hasn't been defined for this method / path
            if (!validationSchemas) {
                return next();
            }

            const { bodySchema, paramsSchema, querySchema } = validationSchemas;

            // Validate body schema and strip unknown fields from the request body
            if (bodySchema) {
                req.body = await ValidationMiddleware.validateSchema({
                    data: body,
                    schema: bodySchema,
                    validationType: 'Body',
                });
            }

            // Validate params schema and strip unknown fields from the request params
            if (paramsSchema) {
                req.params = await ValidationMiddleware.validateSchema({
                    data: params,
                    schema: paramsSchema,
                    validationType: 'Params',
                });
            }

            // Validate query schema and strip unknown fields from the request query
            if (querySchema) {
                req.query = await ValidationMiddleware.validateSchema({
                    data: query,
                    schema: querySchema,
                    validationType: 'Query',
                });
            }

            return next();
        } catch (error: any) {
            console.error(error);
            const { message, status } = parseValidationError(error);
            return res.status(status).json({ error: message });
        }
    }

    private static getSchemas({
        method,
        path,
    }: GetSchemasRequest): ValidationObjectSchemas | undefined {
        // Get path to get the correct validator
        const basePath = getBasePath(path);
        const Validator = validationRegistry.get(basePath);

        if (!Validator) {
            throw new Error('No validator was found for this path.');
        }

        const validator = new Validator();
        return validator.getSchemas(method, path);
    }

    private static async validateSchema({
        data,
        schema,
        validationType,
    }: ValidateSchemaRequest) {
        return schema
            .validate(data, { stripUnknown: true })
            .catch((error) => { throw new Error(`${validationType} validation error: ${error.message}`); });
    }
};
