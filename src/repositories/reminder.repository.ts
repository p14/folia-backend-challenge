import { injectable } from 'inversify';
import { ReminderDocument, reminderSchema } from '../models/reminder.model';
import Repository from './_repository';

@injectable()
export default class ReminderRepository extends Repository<ReminderDocument> {
    public constructor() {
        super('reminders', reminderSchema);
    }
}
