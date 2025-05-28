
----- 1. Check DB, deléte-----
IF DB_ID('DB_SWP392_DUPSS') IS NOT NULL
    DROP DATABASE DB_SWP392_DUPSS
GO

------ 2. CREATE -----
CREATE DATABASE DB_SWP392_DUPSS
GO

----- 3. USE-----
USE DB_SWP392_DUPSS
GO

------ 4. Table úser-----
CREATE TABLE [User] (
    _id UNIQUEIDENTIFIER PRIMARY KEY,
    username NVARCHAR(50),
    email NVARCHAR(100),
    password NVARCHAR(100),
    photoUrl NVARCHAR(MAX),
    fullName NVARCHAR(100),
    phoneNumber NVARCHAR(20),
    role NVARCHAR(50),
    gender NVARCHAR(10),
    isDisabled BIT
)

----- 5. Table Quizz-----
CREATE TABLE Quizz (
    _id UNIQUEIDENTIFIER PRIMARY KEY,
    title NVARCHAR(255),
    type NVARCHAR(50),
    description NVARCHAR(MAX),
    quizze_time INT,
    age_group NVARCHAR(50),
    create_at DATE
)

CREATE TABLE QuizzQuestion (
    _id UNIQUEIDENTIFIER PRIMARY KEY,
    quizz_id UNIQUEIDENTIFIER,
    content NVARCHAR(MAX),
    type NVARCHAR(50),
    FOREIGN KEY (quizz_id) REFERENCES Quizz(_id)
)

CREATE TABLE QuestionOption (
    _id UNIQUEIDENTIFIER PRIMARY KEY,
    question_id UNIQUEIDENTIFIER,
    content NVARCHAR(MAX),
    score INT,
    FOREIGN KEY (question_id) REFERENCES QuizzQuestion(_id)
)

CREATE TABLE QuizzResult (
    _id UNIQUEIDENTIFIER PRIMARY KEY,
    customer_id UNIQUEIDENTIFIER,
    quizz_id UNIQUEIDENTIFIER,
    submitted_at DATE,
    total_score INT,
    risk_level NVARCHAR(50),
    FOREIGN KEY (customer_id) REFERENCES [User](_id),
    FOREIGN KEY (quizz_id) REFERENCES Quizz(_id)
)

CREATE TABLE QuestionAnswer (
    _id UNIQUEIDENTIFIER PRIMARY KEY,
    quizzResult_id UNIQUEIDENTIFIER,
    question_id UNIQUEIDENTIFIER,
    option_id UNIQUEIDENTIFIER,
    textAnswer NVARCHAR(MAX),
    note NVARCHAR(MAX),
    FOREIGN KEY (quizzResult_id) REFERENCES QuizzResult(_id),
    FOREIGN KEY (question_id) REFERENCES QuizzQuestion(_id),
    FOREIGN KEY (option_id) REFERENCES QuestionOption(_id)
)

----- 6. Event và Resgis -----
CREATE TABLE Event (
    _id UNIQUEIDENTIFIER PRIMARY KEY,
    title NVARCHAR(255),
    description NVARCHAR(MAX),
    location NVARCHAR(255),
    time NVARCHAR(50),
    status NVARCHAR(50),
    max_participants INT
)

CREATE TABLE EventRegistration (
    _id UNIQUEIDENTIFIER PRIMARY KEY,
    customer_id UNIQUEIDENTIFIER,
    event_id UNIQUEIDENTIFIER,
    registered_at DATE,
    feedback NVARCHAR(MAX),
    FOREIGN KEY (customer_id) REFERENCES [User](_id),
    FOREIGN KEY (event_id) REFERENCES Event(_id)
)

----- 7. Blog -----
CREATE TABLE Blog (
    _id UNIQUEIDENTIFIER PRIMARY KEY,
    customer_id UNIQUEIDENTIFIER,
    title NVARCHAR(255),
    content NVARCHAR(MAX),
    category NVARCHAR(50),
    created_at DATE,
    updated_at DATE,
    is_post BIT,
    FOREIGN KEY (customer_id) REFERENCES [User](_id)
)

----- 8. Tư vấn (Consulting) -----
CREATE TABLE Consultant (
    _id UNIQUEIDENTIFIER PRIMARY KEY,
    userId UNIQUEIDENTIFIER,
    introduction NVARCHAR(MAX),
    contactLink NVARCHAR(MAX),
    licenseNumber NVARCHAR(50),
    startDate DATE,
    googleMeetLink NVARCHAR(MAX),
    FOREIGN KEY (userId) REFERENCES [User](_id)
);

CREATE TABLE SlotTime (
    _id UNIQUEIDENTIFIER PRIMARY KEY,
    consultant_id UNIQUEIDENTIFIER,
    startTime DATETIME,
    endTime DATETIME,
    isBooked BIT,
    FOREIGN KEY (consultant_id) REFERENCES Consultant(_id)
)

CREATE TABLE Service (
    _id UNIQUEIDENTIFIER PRIMARY KEY,
    serviceName NVARCHAR(100),
    price DECIMAL(10,2),
    number INT,
    description NVARCHAR(MAX),
    isDeleted BIT
)

CREATE TABLE Appointment (
    _id UNIQUEIDENTIFIER PRIMARY KEY,
    slottime_id UNIQUEIDENTIFIER,
    consultant_id UNIQUEIDENTIFIER,
    customer_id UNIQUEIDENTIFIER,
    serviceId UNIQUEIDENTIFIER,
    reasons NVARCHAR(MAX),
    feedback NVARCHAR(MAX),
    notes NVARCHAR(MAX),
    status NVARCHAR(50),
    isFeedback BIT,
    FOREIGN KEY (slottime_id) REFERENCES SlotTime(_id),
    FOREIGN KEY (consultant_id) REFERENCES Consultant(_id),
    FOREIGN KEY (customer_id) REFERENCES [User](_id),
    FOREIGN KEY (serviceId) REFERENCES Service(_id)
)

CREATE TABLE FeedbackOfAppointment (
    _id UNIQUEIDENTIFIER PRIMARY KEY,
    appointment_id UNIQUEIDENTIFIER,
    serviceId UNIQUEIDENTIFIER,
    rating INT,
    comment NVARCHAR(MAX),
    feedbackAt DATE,
    FOREIGN KEY (appointment_id) REFERENCES Appointment(_id),
    FOREIGN KEY (serviceId) REFERENCES Service(_id)
)

CREATE TABLE RecordOfAppointment (
    _id UNIQUEIDENTIFIER PRIMARY KEY,
    appointmentId UNIQUEIDENTIFIER,
    customerId UNIQUEIDENTIFIER,
    report NVARCHAR(MAX),
    FOREIGN KEY (appointmentId) REFERENCES Appointment(_id),
    FOREIGN KEY (customerId) REFERENCES [User](_id)
)
