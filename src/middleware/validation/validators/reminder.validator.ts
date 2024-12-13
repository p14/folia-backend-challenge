import * as yup from 'yup';
import { ValidationObject } from "../validation.types";
import ValidatorController from "./_validator.controller";
import { customDateSchema, customTimeSchema, objectIdSchema, stringSchema } from '../validation.helpers';
import { RecurrenceDay, RecurrenceType } from '../../../models/reminder.model';

export default class ReminderValidator extends ValidatorController {
    constructor() {
        super('/api/reminders', {
            '/': ReminderValidator.baseValidation,
            '/open': ReminderValidator.openBaseValidation,
            '/:reminderId': ReminderValidator.baseExistingValidation,
            '/:reminderId/open': ReminderValidator.openBaseExistingValidation,
        });
    }

    private static baseValidation: ValidationObject = {
        GET: {
            querySchema: yup.object({
                search: yup.string().notRequired(),
                startDate: customDateSchema.notRequired(),
                endDate: customDateSchema.notRequired(),
            }),
        },
        POST: {
            bodySchema: yup.object({
                description: stringSchema.required(),
                recurrenceTime: customTimeSchema.required(),
                recurrenceType: stringSchema.oneOf(Object.values(RecurrenceType)).required(),
                customRecurrenceDay: yup
                    .string()
                    .oneOf(Object.values(RecurrenceDay))
                    .when('recurrenceType', ([recurrenceType], schema) => {
                        if (recurrenceType === RecurrenceType.DAY_OF_THE_WEEK) {
                            return schema.required();
                        }
                        return schema.notRequired();
                    }),
                customRecurrenceInterval: yup
                    .number()
                    .positive()
                    .when('recurrenceType', ([recurrenceType], schema) => {
                        if (recurrenceType === RecurrenceType.INTERVAL) {
                            return schema.required();
                        }
                        return schema.notRequired();
                    }),
            }),
        },
    };

    private static baseExistingValidation: ValidationObject = {
        GET: {
            paramsSchema: yup.object({
                reminderId: objectIdSchema.required(),
            }),
        },
        PUT: {
            bodySchema: yup.object({
                description: stringSchema.required(),
                recurrenceTime: customTimeSchema.required(),
                recurrenceType: stringSchema.oneOf(Object.values(RecurrenceType)).required(),
                customRecurrenceDay: yup
                    .string()
                    .oneOf(Object.values(RecurrenceDay))
                    .when('recurrenceType', ([recurrenceType], schema) => {
                        if (recurrenceType === RecurrenceType.DAY_OF_THE_WEEK) {
                            return schema.required();
                        }
                        return schema.notRequired();
                    }),
                customRecurrenceInterval: yup
                    .number()
                    .positive()
                    .when('recurrenceType', ([recurrenceType], schema) => {
                        if (recurrenceType === RecurrenceType.INTERVAL) {
                            return schema.required();
                        }
                        return schema.notRequired();
                    }),
            }),
            paramsSchema: yup.object({
                reminderId: objectIdSchema.required(),
            }),
        },
        DELETE: {
            paramsSchema: yup.object({
                reminderId: objectIdSchema.required(),
            }),
        },
    };

    private static openBaseValidation: ValidationObject = {
        GET: {
            querySchema: yup.object({
                search: yup.string().notRequired(),
                startDate: customDateSchema.notRequired(),
                endDate: customDateSchema.notRequired(),
            }),
        },
        POST: {
            bodySchema: yup.object({
                userId: objectIdSchema.required(),
                description: stringSchema.required(),
                recurrenceTime: customTimeSchema.required(),
                recurrenceType: stringSchema.oneOf(Object.values(RecurrenceType)).required(),
                customRecurrenceDay: yup
                    .string()
                    .oneOf(Object.values(RecurrenceDay))
                    .when('recurrenceType', ([recurrenceType], schema) => {
                        if (recurrenceType === RecurrenceType.DAY_OF_THE_WEEK) {
                            return schema.required();
                        }
                        return schema.notRequired();
                    }),
                customRecurrenceInterval: yup
                    .number()
                    .positive()
                    .when('recurrenceType', ([recurrenceType], schema) => {
                        if (recurrenceType === RecurrenceType.INTERVAL) {
                            return schema.required();
                        }
                        return schema.notRequired();
                    }),
            }),
        },
    };

    private static openBaseExistingValidation: ValidationObject = {
        GET: {
            paramsSchema: yup.object({
                reminderId: objectIdSchema.required(),
            }),
        },
        PUT: {
            bodySchema: yup.object({
                userId: objectIdSchema.required(),
                description: stringSchema.required(),
                recurrenceTime: customTimeSchema.required(),
                recurrenceType: stringSchema.oneOf(Object.values(RecurrenceType)).required(),
                customRecurrenceDay: yup
                    .string()
                    .oneOf(Object.values(RecurrenceDay))
                    .when('recurrenceType', ([recurrenceType], schema) => {
                        if (recurrenceType === RecurrenceType.DAY_OF_THE_WEEK) {
                            return schema.required();
                        }
                        return schema.notRequired();
                    }),
                customRecurrenceInterval: yup
                    .number()
                    .positive()
                    .when('recurrenceType', ([recurrenceType], schema) => {
                        if (recurrenceType === RecurrenceType.INTERVAL) {
                            return schema.required();
                        }
                        return schema.notRequired();
                    }),
            }),
            paramsSchema: yup.object({
                reminderId: objectIdSchema.required(),
            }),
        },
        DELETE: {
            paramsSchema: yup.object({
                reminderId: objectIdSchema.required(),
            }),
        },
    };
}
