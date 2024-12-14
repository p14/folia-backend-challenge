import { inject, injectable } from 'inversify';
import { AnyKeys, FilterQuery, Types, UpdateQuery } from 'mongoose';
import { RecurrenceDay, RecurrenceType, Reminder, ReminderDocument } from '../models/reminder.model';
import ReminderRepository from '../repositories/reminder.repository';
import TYPES from '../setup/ioc.types';
import { convertToUTCTime } from '../utilities/helpers';

@injectable()
export default class ReminderService {
    private userId: Types.ObjectId | undefined;

    private reminderRepository: ReminderRepository;

    constructor(
        @inject(TYPES.Repositories.Reminder) reminderRepository: ReminderRepository,
    ) {
        this.reminderRepository = reminderRepository;
    }

    /**
     * Sets the class variable "userId"
     * @param {Types.ObjectId} userId
     */
    public setUserId(
        userId: Types.ObjectId,
    ): void {
        this.userId = userId;
    }

    /**
     * Returns the class variable "userId" if it has been set
     * @returns {Types.ObjectId}
     */
    private getRequestersUserId(): Types.ObjectId {
        if (!this.userId) {
            throw new Error('User ID was not set.');
        }

        return this.userId;
    }

    /**
     * Lists reminders with query options
     * @param {Types.ObjectId} userId
     * @param {string | undefined} search
     * @param {Date | undefined} startDate
     * @param {Date | undefined} endDate
     * @returns {FilterQuery<ReminderDocument>}
     */
    public async listReminders(
        search?: string,
        startDate?: Date,
        endDate?: Date,
    ): Promise<ReminderDocument[]> {
        let queryStartDate: Date | null = null;
        let queryEndDate: Date | null = null;

        if (startDate) {
            queryStartDate = new Date(startDate);
            queryStartDate = convertToUTCTime(queryStartDate); // Convert time to UTC to match the DB format
        }

        if (endDate) {
            queryEndDate = new Date(endDate);
            queryEndDate.setUTCHours(23, 59, 59, 999); // Set time to end of day
            queryEndDate = convertToUTCTime(queryEndDate); // Convert time to UTC to match the DB format
        }

        // Build a search query to be used with each type of recurrence
        const searchQuery = ReminderService.buildSearchQuery(search);

        // Retrieve all reminders that meet queried parameters concurrently
        const queriedReminders = await Promise.all([
            ...await this.getQueriedDailyReminders(searchQuery, queryEndDate),
            ...await this.getQueriedIntervalReminders(searchQuery, queryStartDate, queryEndDate),
            ...await this.getQueriedDayOfTheWeekReminders(searchQuery, queryStartDate, queryEndDate),
        ]);

        return queriedReminders;
    }

    /**
     * Builds and returns a query for text searches
     * @param {string | undefined} search
     * @returns {FilterQuery<ReminderDocument>}
     */
    private static buildSearchQuery(
        search?: string,
    ): FilterQuery<ReminderDocument> {
        let searchQuery: FilterQuery<ReminderDocument> = {};

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            searchQuery = {
                $or: [
                    { description: { $regex: searchRegex } },
                    { recurrenceType: { $regex: searchRegex } },
                    { customRecurrenceDay: { $regex: searchRegex } },
                ],
            };
        }

        return searchQuery;
    }

    /**
     * Builds query and gets daily reminders
     * @param {FilterQuery<ReminderDocument>} searchQuery
     * @param {Date | null} queryEndDate
     * @returns {Promise<ReminderDocument[]>}
     */
    private async getQueriedDailyReminders(
        searchQuery: FilterQuery<ReminderDocument>,
        queryEndDate: Date | null,
    ): Promise<ReminderDocument[]> {
        const requestersUserId = this.getRequestersUserId();

        const dailyRecurrenceQuery: FilterQuery<ReminderDocument> = {
            ...searchQuery,
            recurrenceType: RecurrenceType.DAILY,
            userId: requestersUserId,
        };

        if (queryEndDate) {
            dailyRecurrenceQuery.createdAt = {
                $lte: queryEndDate,
            };
        }

        return this.reminderRepository.find(dailyRecurrenceQuery);
    }

    /**
     * Builds query and gets interval reminders
     * @param {FilterQuery<ReminderDocument>} searchQuery
     * @param {Date | null} queryStartDate
     * @param {Date | null} queryEndDate
     * @returns {Promise<ReminderDocument[]>}
     */
    private async getQueriedIntervalReminders(
        searchQuery: FilterQuery<ReminderDocument>,
        queryStartDate: Date | null,
        queryEndDate: Date | null,
    ): Promise<ReminderDocument[]> {
        const requestersUserId = this.getRequestersUserId();

        const intervalRecurrenceQuery: FilterQuery<ReminderDocument> = {
            ...searchQuery,
            recurrenceType: RecurrenceType.INTERVAL,
            customRecurrenceInterval: { $exists: true },
            userId: requestersUserId,
        };

        if (queryEndDate) {
            intervalRecurrenceQuery.createdAt = {
                $lte: queryEndDate,
            };
        }

        let queriedReminders = await this.reminderRepository.find(intervalRecurrenceQuery);

        if (queryStartDate && queryEndDate) {
            queriedReminders = queriedReminders.filter((reminder) => (
                ReminderService.isIntervalInRange(
                    reminder.createdAt,
                    reminder.customRecurrenceInterval as number,
                    queryStartDate,
                    queryEndDate,
                )
            ));
        }

        return queriedReminders;
    }

    /**
     * Checks if an interval falls within a given date range
     * @param {Date} createdAt 
     * @param {number} customRecurrenceInterval 
     * @param {Date} startDate 
     * @param {Date} endDate 
     * @returns 
     */
    private static isIntervalInRange(
        createdAt: Date,
        customRecurrenceInterval: number,
        startDate: Date,
        endDate: Date,
    ) {
        // Ensure all inputs are Date objects
        createdAt = new Date(createdAt);
        startDate = new Date(startDate);
        endDate = new Date(endDate);

        // Convert intervals to milliseconds
        const intervalMs = customRecurrenceInterval * 24 * 60 * 60 * 1000;

        // Calculate the difference in milliseconds between createdAt and startDate
        const timeDifference = startDate.getTime() - createdAt.getTime();

        if (timeDifference < 0) {
            // If startDate is before createdAt, check if the first occurrence falls in the range
            return (createdAt >= startDate) && (createdAt <= endDate);
        }

        // Calculate how many intervals have passed between createdAt and the queried startDate
        const intervalsPassed = Math.ceil(timeDifference / intervalMs);

        // Calculate the next valid occurrence after or on startDate
        const nextOccurrence = new Date(createdAt.getTime() + intervalsPassed * intervalMs);

        // Check if the next occurrence falls within the range
        return (nextOccurrence >= startDate) && (nextOccurrence <= endDate);
    }

    /**
     * Builds query and gets day of the week reminders
     * @param {FilterQuery<ReminderDocument>} searchQuery
     * @param {Date | null} queryStartDate
     * @param {Date | null} queryEndDate
     * @returns {Promise<ReminderDocument[]>}
     */
    private async getQueriedDayOfTheWeekReminders(
        searchQuery: FilterQuery<ReminderDocument>,
        queryStartDate: Date | null,
        queryEndDate: Date | null,
    ): Promise<ReminderDocument[]> {
        const requestersUserId = this.getRequestersUserId();
        const queryDays = ReminderService.getDaysBetween(queryStartDate, queryEndDate);

        const dayOfTheWeekRecurrenceQuery: FilterQuery<ReminderDocument> = {
            ...searchQuery,
            recurrenceType: RecurrenceType.DAY_OF_THE_WEEK,
            customRecurrenceDay: { $exists: true, $in: queryDays },
            userId: requestersUserId,
        };

        if (queryEndDate) {
            dayOfTheWeekRecurrenceQuery.createdAt = { $lte: queryEndDate };
        }

        return this.reminderRepository.find(dayOfTheWeekRecurrenceQuery);
    }

    /**
     * Get the days of the week within a date range
     * @param {Date | null} queriedStartDate
     * @param {Date | null} queriedEndDate
     * @returns {RecurrenceDay[]}
     */
    private static getDaysBetween(
        queriedStartDate: Date | null,
        queriedEndDate: Date | null,
    ): RecurrenceDay[] {
        const daysOfWeek: RecurrenceDay[] = [];
        const dayNames: Record<number, RecurrenceDay> = {
            0: RecurrenceDay.SUNDAY,
            1: RecurrenceDay.MONDAY,
            2: RecurrenceDay.TUESDAY,
            3: RecurrenceDay.WEDNESDAY,
            4: RecurrenceDay.THURSDAY,
            5: RecurrenceDay.FRIDAY,
            6: RecurrenceDay.SATURDAY,
        };

        if (!queriedStartDate || !queriedEndDate) {
            return Object.values(dayNames); // Return all days 
        }

        for (
            let date = new Date(queriedStartDate); // Before all loop logic
            (date <= queriedEndDate) || (daysOfWeek.length === 7); // Break conditions
            date.setDate(date.getDate() + 1) // After each loop logic
        ) {
            daysOfWeek.push(dayNames[date.getUTCDay()]);
        }

        return daysOfWeek;
    }

    /**
     * Creates a new reminder
     * @param {Reminder} reminder
     * @returns {Promise<ReminderDocument>}
     */
    public async createReminder(
        reminder: Reminder,
    ): Promise<ReminderDocument> {
        const requestersUserId = this.getRequestersUserId();

        const reminderDocument: AnyKeys<ReminderDocument> = {
            ...reminder,
            userId: requestersUserId,
        };

        return this.reminderRepository.create(reminderDocument);
    }

    /**
     * Gets a reminder from the database
     * @param {Types.ObjectId} reminderId 
     * @returns {Promise<ReminderDocument>}
     */
    public async getReminder(
        reminderId: Types.ObjectId,
    ): Promise<ReminderDocument> {
        const requestersUserId = this.getRequestersUserId();

        const filterQuery: FilterQuery<ReminderDocument> = {
            _id: reminderId,
            userId: requestersUserId,
        };

        const reminder = await this.reminderRepository.findOne(filterQuery);

        if (!reminder) {
            throw new Error('Reminder not found.');
        }

        return reminder;
    }

    /**
     * Updates a reminder in the database and retrieves the updated document
     * @param {Types.ObjectId} reminderId
     * @param {Partial<Reminder>} reminder
     * @returns {Promise<ReminderDocument>}
     */
    public async updateReminder(
        reminderId: Types.ObjectId,
        reminder: Partial<Reminder>,
    ): Promise<ReminderDocument> {
        const requestersUserId = this.getRequestersUserId();

        const filterQuery: FilterQuery<ReminderDocument> = {
            _id: reminderId,
            userId: requestersUserId,
        };

        const updateQuery: UpdateQuery<ReminderDocument> = {
            $set: {
                ...reminder,
                userId: requestersUserId,
            },
        };

        const updatedReminder = await this.reminderRepository.findOneAndUpdate(filterQuery, updateQuery);

        if (!updatedReminder) {
            throw new Error('Reminder not found.');
        }

        return updatedReminder;
    }

    /**
     * Deletes a reminder from the database
     * @param {Types.ObjectId} reminderId
     * @returns {Promise<DeleteResult>}
     */
    public async deleteReminder(
        reminderId: Types.ObjectId,
    ): Promise<{ acknowledged: boolean; deletedCount: number }> {
        const requestersUserId = this.getRequestersUserId();

        const filterQuery: FilterQuery<ReminderDocument> = {
            _id: reminderId,
            userId: requestersUserId,
        };

        const deleteData = await this.reminderRepository.deleteOne(filterQuery);

        if (!deleteData.deletedCount) {
            throw new Error('Reminder not found.');
        }

        return deleteData;
    }
}
