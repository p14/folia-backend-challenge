import { ValidationRequestMethod, ValidationSchema } from "../validation.types";

export default class ValidatorController {
    protected pathname = '';

    private validationSchema: ValidationSchema = {};

    constructor(
        path: string,
        validationSchema: ValidationSchema,
    ) {
        this.pathname = path;
        this.validationSchema = validationSchema;
    }

    public getSchemas(method: ValidationRequestMethod, path: string) {
        const newPath = path.replace(this.pathname, '');
        return this.validationSchema[newPath]?.[method];
    }
};
