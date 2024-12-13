# Overview

You are tasked with building the backend of a simple reminders application. Front-end web and mobile applications will interact with your backend to allow users to schedule new reminders, view existing reminders, and modify/delete existing reminders. Reminders will be set up on a recurring basis - for example, “Wake up: every morning at 8am”, or “Lunch meeting: every Monday at 12:30pm”.

## Requirements

The structure of your application should include:

- A domain model for representing reminders and their recurrence rules
- A RESTful web service for use by front-end applications
- A mechanism for persisting and querying these structures (see starter project notes)

The following minimum functionality should be included:

- Create, update, and delete reminders and their recurrence rules
- View a list of reminders that will occur in a given date range, based on their recurrence rules
- Search for reminders based on a keyword
- Allow for multiple types of recurrence rules, for example “every day”, “every n days”, and “every Monday”
