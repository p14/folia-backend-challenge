import { Request } from 'express';
import { inject } from 'inversify';
import {
    BaseHttpController, controller,
    httpDelete, httpGet, httpPost, httpPut,
    request, requestParam, queryParam,
} from 'inversify-express-utils';
import { Types } from 'mongoose';
import { Reminder } from '../models/reminder.model';
import ReminderService from '../services/reminder.service';
import TYPES from '../setup/ioc.types';
import OpenReminderService from '../services/open_reminder.service';

@controller(TYPES.Namespace.Reminder, TYPES.Middleware.Validation)
export default class ReminderController extends BaseHttpController {
    private openReminderService: OpenReminderService;

    private reminderService: ReminderService;

    constructor(
        @inject(TYPES.Services.OpenReminder) openReminderService: OpenReminderService,
        @inject(TYPES.Services.Reminder) reminderService: ReminderService,
    ) {
        super();
        this.openReminderService = openReminderService;
        this.reminderService = reminderService;
    }

    /* Open Endpoints */

    @httpGet('/open')
    public async listOpenReminders(
        @queryParam('search') search: string | undefined,
        @queryParam('startDate') startDate: Date | undefined,
        @queryParam('endDate') endDate: Date | undefined,
    ) {
        try {
            // Decode search query to be a plain string
            const decodedSearch = decodeURIComponent(search ?? '');

            // Validate startDate and endDate chronological order
            if (startDate && endDate) {
                const queryStartDate = new Date(startDate);
                const queryEndDate = new Date(endDate);

                if (queryStartDate > queryEndDate) {
                    throw new Error('Invalid date range query.');
                }
            }

            // Retrieve reminders based on search value
            const reminders = await this.openReminderService.listReminders(decodedSearch, startDate, endDate);
            return this.json(reminders, 200);
        } catch (e: any) {
            console.error(e.message);
            return this.json({ error: e.message }, 500);
        }
    }

    @httpPost('/open')
    public async createOpenReminder(
        @request() req: Request,
    ) {
        try {
            // Build reminder
            const reminder: Reminder = { ...req.body };

            // Create the new subscription
            const newReminder = await this.openReminderService.createReminder(reminder);
            return this.json(newReminder, 200);
        } catch (e: any) {
            console.error(e.message);
            return this.json({ error: e.message }, 500);
        }
    }

    @httpGet('/:reminderId/open')
    public async getOpenReminder(
        @requestParam('reminderId') reminderId: Types.ObjectId,
    ) {
        try {
            // Get the requested reminder
            const reminder = await this.openReminderService.getReminder(reminderId);
            return this.json(reminder, 200);
        } catch (e: any) {
            console.error(e.message);
            return this.json({ error: e.message }, 500);
        }
    }

    @httpPut('/:reminderId/open')
    public async updateOpenReminder(
        @request() req: Request,
        @requestParam('reminderId') reminderId: Types.ObjectId,
    ) {
        try {
            // Build reminder
            const reminder: Reminder = { ...req.body };

            // Update the requested reminder
            const updatedReminder = await this.openReminderService.updateReminder(reminderId, reminder);
            return this.json(updatedReminder, 200);
        } catch (e: any) {
            console.error(e.message);
            return this.json({ error: e.message }, 500);
        }
    }

    @httpDelete('/:reminderId/open')
    public async deleteOpenReminder(
        @requestParam('reminderId') reminderId: Types.ObjectId,
    ) {
        try {
            // Delete the requested reminder
            await this.openReminderService.deleteReminder(reminderId);
            return this.statusCode(204);
        } catch (e: any) {
            console.error(e.message);
            return this.json({ error: e.message }, 500);
        }
    }

    /* Secure Endpoints */

    @httpGet('/')
    public async listReminders(
        @queryParam('search') search: string | undefined,
        @queryParam('startDate') startDate: Date | undefined,
        @queryParam('endDate') endDate: Date | undefined,
    ) {
        try {
            // Get requesting user's ID so users can only search their own reminders
            const { _id: userId } = this.httpContext.user.details;
            this.reminderService.setUserId(userId);

            // Decode search query to be a plain string
            const decodedSearch = decodeURIComponent(search ?? '');

            // Validate startDate and endDate chronological order
            if (startDate && endDate) {
                const queryStartDate = new Date(startDate);
                const queryEndDate = new Date(endDate);

                if (queryStartDate > queryEndDate) {
                    throw new Error('Invalid date range query.');
                }
            }

            // Retrieve reminders based on search value
            const reminders = await this.reminderService.listReminders(decodedSearch, startDate, endDate);
            return this.json(reminders, 200);
        } catch (e: any) {
            console.error(e.message);
            return this.json({ error: e.message }, 500);
        }
    }

    @httpPost('/')
    public async createReminder(
        @request() req: Request,
    ) {
        try {
            // Get requesting user's ID so users can only create their own reminders
            const { _id: userId } = this.httpContext.user.details;
            this.reminderService.setUserId(userId);

            // Build reminder
            const reminder: Reminder = { ...req.body };

            // Create the new subscription
            const newReminder = await this.reminderService.createReminder(reminder);
            return this.json(newReminder, 200);
        } catch (e: any) {
            console.error(e.message);
            return this.json({ error: e.message }, 500);
        }
    }

    @httpGet('/:reminderId')
    public async getReminder(
        @requestParam('reminderId') reminderId: Types.ObjectId,
    ) {
        try {
            // Get requesting user's ID so users can only retrieve their own reminders
            const { _id: userId } = this.httpContext.user.details;
            this.reminderService.setUserId(userId);

            // Get the requested reminder
            const reminder = await this.reminderService.getReminder(reminderId);
            return this.json(reminder, 200);
        } catch (e: any) {
            console.error(e.message);
            return this.json({ error: e.message }, 500);
        }
    }

    @httpPut('/:reminderId')
    public async updateReminder(
        @request() req: Request,
        @requestParam('reminderId') reminderId: Types.ObjectId,
    ) {
        try {
            // Get requesting user's ID so users can only update their own reminders
            const { _id: userId } = this.httpContext.user.details;
            this.reminderService.setUserId(userId);

            // Build reminder
            const reminder: Reminder = { ...req.body };

            // Update the requested reminder
            const updatedReminder = await this.reminderService.updateReminder(reminderId, reminder);
            return this.json(updatedReminder, 200);
        } catch (e: any) {
            console.error(e.message);
            return this.json({ error: e.message }, 500);
        }
    }

    @httpDelete('/:reminderId')
    public async deleteReminder(
        @requestParam('reminderId') reminderId: Types.ObjectId,
    ) {
        try {
            // Get requesting user's ID so users can only delete their own reminders
            const { _id: userId } = this.httpContext.user.details;
            this.reminderService.setUserId(userId);

            // Delete the requested reminder
            await this.reminderService.deleteReminder(reminderId);
            return this.statusCode(204);
        } catch (e: any) {
            console.error(e.message);
            return this.json({ error: e.message }, 500);
        }
    }
}
