import { isValidObjectId } from 'mongoose';
import { mixed, object, ObjectShape, string } from 'yup';
import { ValidationRequestMethod } from './validation.types';
import { dateRegex, timeRegex } from '../../utilities/helpers';

// Validation request methods assertion
export const isValidationRequestMethod = (method: string): method is ValidationRequestMethod => {
    return ['DELETE', 'GET', 'PATCH', 'POST', 'PUT'].includes(method);
};

// Custom validation schema for MongoDB ObjectId
export const objectIdSchema = string().test({
    message: 'Invalid ObjectId',
    name: 'objectId',
    test: (value) => isValidObjectId(String(value)),
});

export const stringSchema = string().trim().not(['null']);
export const emailSchema = string().email().trim().not(['null']);

// Custom validation schema for 24-hour time clock
export const customTimeSchema = string().test({
    message: 'Invalid time format',
    name: '24-hour time',
    test: (value) => timeRegex.test(String(value)),
});

// Custom validation schema for query date (YYYY-MM-DD)
export const customDateSchema = string().test({
    message: 'Invalid date format',
    name: 'YYYY-MM-DD',
    test: (value) => dateRegex.test(String(value)),
});

// Custom validation schema for multiple object possibilities
export const oneOfObjectSchema = (
    propertyName: string,
    objectShapes: ObjectShape[],
) => mixed().test({
    message: `Invalid ${propertyName}`,
    name: propertyName,
    test: (value) => objectShapes.some((shape) => object(shape).isValidSync(value)),
});

// Retrieves the base path of a request
export const getBasePath = (path: string): string => {
    const fixedPaths = ['/api'];

    // Find the matching fixed path is it exists
    const matchingFixedPath = fixedPaths
        .find((fixedPath) => path.startsWith(fixedPath)) ?? '';

    // Remove the fixed path and any trailing slashes from the full path
    const [, firstPathSegment] = path
        .replace(matchingFixedPath, '')
        .split('/');

    return `${matchingFixedPath}/${firstPathSegment}`;
};

// Parse validation errors
export const parseValidationError = (error: any) => {
    const validationErrors: Array<string> = [
        'No validator was found for this path.',
    ];

    let status: number = 500;

    if (validationErrors.includes(error.message)) {
        status = 501;
    }

    return { message: error.message, status };
};
