import * as yup from 'yup';
import { ValidationObject } from "../validation.types";
import ValidatorController from "./_validator.controller";
import { emailSchema, stringSchema } from '../validation.helpers';

export default class AuthValidator extends ValidatorController {
    constructor() {
        super('/api/reminders', {
            '/register': AuthValidator.registerValidation,
            '/login': AuthValidator.logInValidation,
        });
    }

    private static registerValidation: ValidationObject = {
        POST: {
            bodySchema: yup.object({
                email: emailSchema.required(),
                name: stringSchema.required(),
                password: stringSchema.required(),
            }),
        },
    };

    private static logInValidation: ValidationObject = {
        POST: {
            bodySchema: yup.object({
                email: emailSchema.required(),
                password: stringSchema.required(),
            }),
        },
    };
}
