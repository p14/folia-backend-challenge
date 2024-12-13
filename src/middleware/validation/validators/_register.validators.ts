import ValidatorController from './_validator.controller';
import AuthValidator from './auth.validator';
import ReminderValidator from './reminder.validator';

type ValidatorConstructor = new () => ValidatorController;
const validationRegistry = new Map<string, ValidatorConstructor>();

// Register validators
validationRegistry.set('/api/auth', AuthValidator);
validationRegistry.set('/api/reminders', ReminderValidator);

export default validationRegistry;
