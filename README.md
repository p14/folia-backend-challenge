# Folia Health Submission

A Node.js application built with TypeScript, designed to handle reminders with recurrence functionality. This application uses a lightweight inverse of control container library to handle dependency injection.

This project supports Docker-based deployment and includes clear separation of development and production workflows.

## Deployment

### Docker

#### Build and Run with Docker Compose

1. Clone the repository:

    ```
    git clone https://github.com/p14/folia-backend-challenge
    cd folia-backend-challenge
    ```

1. Create an environment file

    ```
    touch .env
    ```

3. Add environment variables

    ```
    PORT=8080
    API_URL=http://localhost:8080
    CLIENT_URL=http://localhost:5173
    DB_URI=<provided with submission email>
    SECRET_KEY=<create any key>
    ```

4. Build and start the application:

    ```
    docker compose up -d --build
    ```

5. Access the application:

    * Navigate to `http://localhost:8080` in your browser.

#### Build and Run with Docker Compose

1. To stop and remove the running containers:

    ```
    docker compose down
    ```


### Local Development

1. Clone the repository:

    ```
    git clone https://github.com/p14/folia-backend-challenge
    cd folia-backend-challenge
    ```

1. Create an environment file

    ```
    touch .env
    ```

3. Add environment variables

    ```
    PORT=8080
    API_URL=http://localhost:8080
    CLIENT_URL=http://localhost:5173
    DB_URI=<provided with submission email>
    SECRET_KEY=<create any key>
    ```

4. Install dependencies:

    ```
    npm install
    ```

5. Start the development server:

    ```
    npm run dev
    ```

6. Access the application:
    * Navigate to `http://localhost:8080` in your browser.

## Features

### Reminder Management

* List recurring reminders by query
    * Query with a text search
    * Query with a date minimum
    * Query with a date maximum
* Creates recurring reminders
* Read recurring reminders
* Update recurring reminders
* Delete recurring reminders
* Recurrence options:
    * Daily recurrence
    * Weekly reminders on a specific day of the week
        * Requires a valid "customRecurrenceDay" to be entered
    * Custom intervals (e.g., every X days)
        * Requires a valid "customRecurrenceInterval" to be entered

### Authentication

* Register a user
* Log in as a user
* Returns an JWT token for authentication

> _Authentication and user accounts were not implemented to industry standards. This implementation is in place to help demonstrate the "Reminders" functionality. Please DO NOT use any sensitive information when interacting with the authentication layer. A fake email and generic password (e.g., "password") will suffice for the purposes of this demonstration._

### Validation Middleware

* Validate request bodies, params, and queries
    * Conditionally required fields for specific recurrence rules
* Strips unexpected properties from the request body before processing in the controller

## API Endpoints

### Reminder endpoints

#### Secure endpoints
These endpoints require valid bearer auth token and limits access of reminders to the requesting user. A token is granted upon successfully registering a new account or successfully logging into an existing account. If you wish to use the auth endpoints and do not want to create an account, feel free to get an auth token with the following credentials:

```json
{
    "email": "test@email.com",
    "password": "password"
}
```

* GET `/api/reminders`
    * Lists a reminders with optional queries
    * Query:
        - search: string
        - startDate: string (must be formatted as: _HH:mm_)
        - endDate: string (one of: _DAILY, INTERVAL, DAY_OF_THE_WEEK_)

* POST `/api/reminders`
    * Creates a new reminder
    * Body:
        - description: string (required)
        - recurrenceTime: string (must be formatted as: _HH:mm_) (required)
        - recurrenceType: string (one of: _DAILY, INTERVAL, DAY_OF_THE_WEEK_) (required)
        - customRecurrenceDay: string (one of: _Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday_) (required if: recurrenceType === DAY_OF_THE_WEEK)
        - customRecurrenceInterval: integer (required if: recurrenceType === INTERVAL)

* GET `/api/reminders/:reminderId`
    * Gets a reminders by ID
    * Params:
        - reminderId: string (24 character string to comply with MongoDB's ObjectID) (required)

* PUT `/api/reminders/:reminderId`
    * Updates a new reminder
    * Params:
        - reminderId: string (24 character string to comply with MongoDB's ObjectID) (required)
    * Body:
        - description: string (required)
        - recurrenceTime: string (must be formatted as: _HH:mm_) (required)
        - recurrenceType: string (one of: _DAILY, INTERVAL, DAY_OF_THE_WEEK_) (required)
        - customRecurrenceDay: string (one of: _Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday_) (required if: recurrenceType === DAY_OF_THE_WEEK)
        - customRecurrenceInterval: integer (required if: recurrenceType === INTERVAL)

* DELETE `/api/reminders/:reminderId`
    * Deletes a reminders by ID
    * Params:
        - reminderId: string (24 character string to comply with MongoDB's ObjectID) (required)

#### Open endpoints
These endpoints do not require an auth token and accesses reminders associated with all users.

* GET `/api/reminders/open`
    * Lists a reminders with optional queries
    * Query:
        - search: string
        - startDate: string (must be formatted as: _HH:mm_)
        - endDate: string (one of: _DAILY, INTERVAL, DAY_OF_THE_WEEK_)

* POST `/api/reminders/open`
    * Creates a new reminder
    * Body:
        - userId: string (24 character string to comply with MongoDB's ObjectID) (required)
        - description: string (required)
        - recurrenceTime: string (must be formatted as: _HH:mm_) (required)
        - recurrenceType: string (one of: _DAILY, INTERVAL, DAY_OF_THE_WEEK_) (required)
        - customRecurrenceDay: string (one of: _Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday_) (required if: recurrenceType === DAY_OF_THE_WEEK)
        - customRecurrenceInterval: integer (required if: recurrenceType === INTERVAL)

* GET `/api/reminders/:reminderId/open`
    * Gets a reminders by ID
    * Params:
        - reminderId: string (24 character string to comply with MongoDB's ObjectID) (required)

* PUT `/api/reminders/:reminderId/open`
    * Updates a new reminder
    * Params:
        - reminderId: string (24 character string to comply with MongoDB's ObjectID) (required)
    * Body:
        - userId: string (24 character string to comply with MongoDB's ObjectID) (required)
        - description: string (required)
        - recurrenceTime: string (must be formatted as: _HH:mm_) (required)
        - recurrenceType: string (one of: _DAILY, INTERVAL, DAY_OF_THE_WEEK_) (required)
        - customRecurrenceDay: string (one of: _Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday_) (required if: recurrenceType === DAY_OF_THE_WEEK)
        - customRecurrenceInterval: integer (required if: recurrenceType === INTERVAL)

* DELETE `/api/reminders/:reminderId/open`
    * Deletes a reminders by ID
    * Params:
        - reminderId: string (24 character string to comply with MongoDB's ObjectID) (required)

### Auth endpoints

* POST `/api/auth/register`
    * Creates a new user account
    * Body:
        - email: string (required)
        - name: string (required)
        - password: string (required)

* POST `/api/auth/login`
    * Logs into an existing user account
    * Body:
        - email: string (required)
        - password: string (required)

## Introductory Walkthrough

https://www.loom.com/share/67a1591076834f9c9b03e281b31d62ec
