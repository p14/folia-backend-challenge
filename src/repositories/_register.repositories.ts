import { Container } from 'inversify';
import TYPES from '../setup/ioc.types';
import ReminderRepository from './reminder.repository';
import UserRepository from './user.repository';

export default function registerRepositories(container: Container) {
    /* Scoped */
    container
        .bind<ReminderRepository>(TYPES.Repositories.Reminder)
        .to(ReminderRepository);

    container
        .bind<UserRepository>(TYPES.Repositories.User)
        .to(UserRepository);
};
