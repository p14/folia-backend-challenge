import { AnySchema } from 'yup';

export type ValidationRequestMethod = (
    | 'DELETE'
    | 'GET'
    | 'PATCH'
    | 'POST'
    | 'PUT'
);

export type ValidationObjectSchemas = {
    bodySchema?: AnySchema
    paramsSchema?: AnySchema
    querySchema?: AnySchema
};

export type ValidationObject = {
    [K in ValidationRequestMethod]?: ValidationObjectSchemas;
};

export type ValidationSchema = Record<string, ValidationObject>;

export type GetSchemasRequest = {
    method: ValidationRequestMethod
    path: string
};

export type ValidateSchemaRequest = {
    data: object
    schema: AnySchema
    validationType: 'Body' | 'Params' | 'Query'
};
