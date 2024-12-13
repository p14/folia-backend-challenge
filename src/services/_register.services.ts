import { Container } from 'inversify';
import TYPES from '../setup/ioc.types';
import AuthService from './auth.service';
import CronService from './cron.service';
import OpenReminderService from './open_reminder.service';
import ReminderService from './reminder.service';
import UserService from './user.service';

export default function registerServices(container: Container) {
    /* Scoped */
    container
        .bind<AuthService>(TYPES.Services.Auth)
        .to(AuthService);

    container
        .bind<OpenReminderService>(TYPES.Services.OpenReminder)
        .to(OpenReminderService);

    container
        .bind<ReminderService>(TYPES.Services.Reminder)
        .to(ReminderService);

    container
        .bind<UserService>(TYPES.Services.User)
        .to(UserService);

    /* Singleton */
    container
        .bind<CronService>(TYPES.Services.Cron)
        .to(CronService)
        .inSingletonScope();
};
