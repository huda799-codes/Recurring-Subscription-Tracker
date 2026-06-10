# SaveX – Recurring Subscription Tracker

SaveX is a web-based recurring subscription tracking system designed to help users manage their active subscriptions, monitor recurring expenses, view upcoming renewal dates, and analyze monthly and yearly spending patterns through a clean and interactive dashboard.

The application provides user authentication, subscription management, expense analytics, renewal reminders, and a professional dark-themed interface. It is built as a full-stack project using Spring Boot for the backend, MySQL for database storage, and HTML, CSS, and JavaScript for the frontend.

---

## Project Overview

In today’s digital world, users often subscribe to multiple services such as streaming platforms, cloud storage, software tools, gaming services, music apps, and educational platforms. Managing all these recurring payments manually can become difficult and may lead to unnecessary spending.

SaveX solves this problem by providing a centralized platform where users can add, view, edit, delete, and analyze their subscriptions. The system helps users stay aware of their recurring payments and upcoming billing dates.

---

## Key Features

### User Authentication

* Create a new user account
* Login using registered email and password
* Store user information in the MySQL database
* Maintain login session using browser local storage

### Subscription Management

* Add new subscriptions
* View all active subscriptions
* Edit existing subscription details
* Delete subscriptions
* Store subscription records in MySQL database

### Dashboard Overview

* Total active subscriptions
* Monthly spending calculation
* Yearly spending projection
* Upcoming renewals count
* Clean and professional dashboard interface

### Expense Analytics

* Monthly subscription cost analysis
* Yearly subscription cost analysis
* Category-wise spending visualization
* Billing cycle distribution
* Interactive charts using Chart.js

### Renewal Reminders

* Display subscriptions renewing within the next 7 days
* Show overdue subscriptions
* Highlight urgent renewals
* Notification badge for upcoming renewals

### AI Insights Section

* Provides smart expense summary based on subscription data
* Identifies high-cost subscriptions
* Shows optimization suggestions
* Displays spending and renewal insights

### Professional Frontend UI

* Dark premium theme
* Responsive design
* SVG-based icons
* No emoji-based interface
* Modern cards, tables, modals, buttons, and charts

---

## Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript
* Chart.js
* SVG Icons

### Backend

* Java
* Spring Boot
* REST APIs
* JDBC

### Database

* MySQL

### Development Tools

* IntelliJ IDEA
* MySQL Workbench
* Web Browser
* Maven

---

## Project Structure

```text
subscriptiontracker/
│
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       ├── config/
│       │       │   └── CorsConfig.java
│       │       │
│       │       ├── controller/
│       │       │   ├── AuthController.java
│       │       │   ├── SubscriptionController.java
│       │       │   ├── ExpenseController.java
│       │       │   ├── AIController.java
│       │       │   └── FileController.java
│       │       │
│       │       ├── dao/
│       │       │   ├── UserDAO.java
│       │       │   ├── SubscriptionDAO.java
│       │       │   ├── CategoryDAO.java
│       │       │   └── PaymentDAO.java
│       │       │
│       │       ├── model/
│       │       │   ├── User.java
│       │       │   ├── Subscription.java
│       │       │   ├── PaymentHistory.java
│       │       │   ├── AIInsight.java
│       │       │   ├── BillingCycle.java
│       │       │   └── DatabaseConnection.java
│       │       │
│       │       ├── services/
│       │       │   ├── SubscriptionService.java
│       │       │   ├── AnalyticsService.java
│       │       │   ├── GeminiService.java
│       │       │   └── GroqService.java
│       │       │
│       │       ├── util/
│       │       │   ├── DBConnection.java
│       │       │   ├── DatabaseInitializer.java
│       │       │   └── FileHandler.java
│       │       │
│       │       └── subscriptiontracker/
│       │           └── Main.java
│       │
│       └── resources/
│           ├── static/
│           │   ├── index.html
│           │   ├── dashboard.html
│           │   ├── styles.css
│           │   ├── script.js
│           │   └── svg-icons.js
│           │
│           └── application.properties
│
├── pom.xml
└── README.md
```

---

## Database Design

### Database Name

```sql
subscription_tracker
```

### Users Table

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);
```

### Subscriptions Table

```sql
CREATE TABLE subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(255) NOT NULL,
    amount DOUBLE NOT NULL,
    category VARCHAR(255) NOT NULL,
    billing_cycle VARCHAR(255) NOT NULL,
    next_billing_date VARCHAR(255) NOT NULL
);
```

---

## API Endpoints

### Authentication APIs

| Method | Endpoint           | Description               |
| ------ | ------------------ | ------------------------- |
| POST   | `/api/auth/signup` | Create a new user account |
| POST   | `/api/auth/login`  | Login existing user       |

### Subscription APIs

| Method | Endpoint              | Description                     |
| ------ | --------------------- | ------------------------------- |
| GET    | `/subscriptions`      | Fetch all subscriptions         |
| POST   | `/subscriptions`      | Add a new subscription          |
| PUT    | `/subscriptions/{id}` | Update an existing subscription |
| DELETE | `/subscriptions/{id}` | Delete a subscription           |

### Expense APIs

| Method | Endpoint            | Description                   |
| ------ | ------------------- | ----------------------------- |
| GET    | `/expenses/monthly` | Get monthly expense           |
| GET    | `/expenses/yearly`  | Get yearly expense            |
| GET    | `/expenses/annual`  | Get annual expense projection |

### AI APIs

| Method | Endpoint     | Description                            |
| ------ | ------------ | -------------------------------------- |
| GET    | `/ai/gemini` | Generate Gemini AI insight placeholder |
| GET    | `/ai/groq`   | Generate Groq AI insight placeholder   |

---

## Application Flow

1. User opens the SaveX login page.
2. User creates an account or logs in.
3. Login/signup request is sent to the Spring Boot backend.
4. User data is stored or verified through MySQL.
5. After successful login, the user is redirected to the dashboard.
6. Dashboard loads subscription data from the backend.
7. User can add, edit, delete, and analyze subscriptions.
8. Renewal reminders and expense summaries are updated dynamically.

---

## How to Run the Project

### Step 1: Start MySQL

Make sure MySQL Server is running on your system.

### Step 2: Create Database

Open MySQL Workbench and run:

```sql
CREATE DATABASE subscription_tracker;
USE subscription_tracker;
```

Then create the required tables.

### Step 3: Configure Database Connection

Open `application.properties` and set your MySQL username and password:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/subscription_tracker?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=your_mysql_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true

server.port=8080
```

Also make sure the password in `DBConnection.java` matches the same MySQL password.

### Step 4: Run Spring Boot Application

Run the main class:

```text
Main.java
```

Wait until the console shows that Spring Boot has started successfully on port `8080`.

### Step 5: Open the Web App

Open the browser and visit:

```text
http://localhost:8080/index.html
```

---

## Important Notes

Do not open the frontend using IntelliJ static preview such as:

```text
http://localhost:63342/...
```

Always open the project from:

```text
http://localhost:8080/index.html
```

This ensures the frontend and backend remain connected properly.

---

## Screens and Pages

### Login Page

The login page allows existing users to access their SaveX dashboard.

### Signup Page

The signup page allows new users to create an account and store their information in the database.

### Dashboard Page

The dashboard displays summary cards, charts, upcoming renewals, and expense information.

### Subscriptions Page

The subscriptions page allows users to manage their subscription records.

### Analytics Page

The analytics page displays spending patterns using charts.

### AI Insights Page

The AI insights page provides useful subscription-related suggestions.

### Reminders Page

The reminders page displays upcoming and overdue renewals.

---

## OOP Concepts Used

### Encapsulation

Model classes such as `User`, `Subscription`, and `PaymentHistory` use private data members with public getters and setters.

### Abstraction

Controllers and services hide internal logic from the frontend and expose only required API endpoints.

### Modularity

The project is divided into separate packages such as controller, dao, model, services, config, and util.

### Separation of Concerns

Each layer has a specific responsibility:

* Controller handles API requests
* Service handles business logic
* DAO handles database operations
* Model represents data objects
* Frontend handles user interaction

---

## MVC Architecture

SaveX follows an MVC-style structure.

### Model

Represents the data and entities of the system.

Examples:

* `User.java`
* `Subscription.java`
* `PaymentHistory.java`

### View

Represents the frontend interface.

Examples:

* `index.html`
* `dashboard.html`
* `styles.css`
* `script.js`

### Controller

Handles incoming requests from the frontend.

Examples:

* `AuthController.java`
* `SubscriptionController.java`
* `ExpenseController.java`

---

## Future Enhancements

* Add password encryption
* Add user-specific subscriptions using `user_id`
* Add email reminders for upcoming renewals
* Add real Gemini or Groq API integration
* Add payment history tracking
* Add downloadable monthly/yearly reports
* Add search and filter options for subscriptions
* Add profile management
* Add budget limit alerts

---

## Project Purpose

This project was developed as an academic full-stack web application to demonstrate practical use of Java, Spring Boot, MySQL, REST APIs, frontend development, database connectivity, and object-oriented programming concepts.

SaveX is suitable for a semester project, portfolio project, and academic presentation because it combines real-world problem solving with a professional user interface and complete backend integration.

---

## Author

**Huda Faisal**

Computer Engineering Student

---

## Project Title

**SaveX – Smart Recurring Subscription Tracker**
