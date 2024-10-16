MERJE Cineplex Ticketing System
This repository contains the source code for the MERJE Cineplex Ticketing System, a comprehensive solution for managing movie ticket sales, user accounts, and theater operations. The system was developed as part of a university project for the course System Analysis and Design (ENG23 3031) at Suranaree University of Technology.

Project Overview
The system is designed to streamline the process of booking movie tickets, managing movie information, and processing payments for the MERJE Cineplex. It allows users to select movies, reserve seats, and make payments. Admin users can manage movies, showtimes, and user accounts, while staff can check the status of tickets at the theater entrance.

Features
User Management: User login, registration, and authentication.
Movie Management: Admins can add, edit, and remove movie listings.
Showtime Management: Admins can create and manage showtimes.
Ticket Booking: Users can select available showtimes, reserve seats, and generate a digital ticket.
Payment Processing: Integration with external services to allow online ticket purchases.
QR Code Scanning: Staff can scan and validate tickets using QR codes.
Rewards System: Users can accumulate points and redeem rewards based on ticket purchases.
System Components
The system is divided into the following modules:

Ticket Management: Allows users to book tickets, view booking history, and receive QR codes for entry.
Movie Management: Provides the functionality for adding and managing movies.
Showtime Management: Allows admins to define and update movie showtimes.
Payment Processing: Handles user payments for ticket reservations, including integration with external services.
Rewards System: Users can exchange points for rewards after ticket purchases.
Payment Processing
The Payment Processing system includes integration with external services for generating QR codes for payments and verifying bank slips:

PromptPay QR Code Generation: The system uses PromptPay.io to generate PromptPay QR codes for payment transactions. After the user selects their seats and confirms the booking, a QR code is created using this service to facilitate the payment process.

Slip Verification: To ensure authenticity, the system integrates with SlipOK for validating user-uploaded payment slips. This ensures that the transaction is completed securely, and only valid slips are accepted by the system.

Technologies Used
Backend: Developed using Go and the Gin web framework for building REST APIs.
Frontend: Built with React for a dynamic and responsive user interface.
Database: MySQL for data storage, including movies, showtimes, tickets, and user information.
QR Code: Integrated QR code generation and scanning for ticket validation.
External Services:
PromptPay.io for QR code generation.
SlipOK for payment slip verification.
Installation
To install and run the system locally, follow these steps:

Clone the repository:

bash
Copy code
git clone https://github.com/your-repo/merje-cineplex.git
Install dependencies:

bash
Copy code
cd backend
go mod download
bash
Copy code
cd frontend
npm install
Set up the database using the provided MySQL scripts located in the database folder.

Start the backend server:

bash
Copy code
go run main.go
Start the frontend application:

bash
Copy code
npm start
Usage
User Login: Users can register and log in to manage their bookings.
Ticket Booking: After logging in, users can select a movie and book seats.
QR Code Scanning: Theater staff can scan the QR code at the theater entrance to validate the ticket.
Contributors
Thannika Mangmee (B6507343)
Kongsawan Chanburi (B6508494)
Chanyanut Sodsri (B6508852)
Chanchai Lertsri (B6513535)
Kamonchanok Thanonndang (B6526405)
Supatsorn Soisuwan (B6526436)
License
This project is licensed under the MIT License - see the LICENSE file for details.

