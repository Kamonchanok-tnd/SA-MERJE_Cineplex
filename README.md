# MERJE Cineplex Ticketing System

This repository contains the source code for the **MERJE Cineplex Ticketing System**, a comprehensive solution for managing movie ticket sales, user accounts, and theater operations. The system was developed as part of a university project for the course **System Analysis and Design (ENG23 3031)** at **Suranaree University of Technology**.

## Project Overview

The system is designed to streamline the process of booking movie tickets, managing movie information, and processing payments for the MERJE Cineplex. It allows users to select movies, reserve seats, and make payments. Admin users can manage movies, showtimes, and user accounts, while staff can check the status of tickets at the theater entrance.

### Features

- **User Management**: User login, registration, and authentication.
- **Movie Management**: Admins can add, edit, and remove movie listings.
- **Showtime Management**: Admins can create and manage showtimes.
- **Ticket Booking**: Users can select available showtimes, reserve seats, and generate a digital ticket.
- **Payment Processing**: Integration with external services to allow online ticket purchases.
- **QR Code Scanning**: Staff can scan and validate tickets using QR codes.
- **Rewards System**: Users can accumulate points and redeem rewards based on ticket purchases.

## System Components

The system is divided into the following modules:

1. **Seat Booking System**: Allows users to book tickets, view booking history, and receive QR codes for entry.
2. **Movie Management System**: Provides the functionality for adding and managing movies.
3. **Showtime Management System**: Allows admins to define and update movie showtimes.
4. **Payment Processing System**: Handles user payments for ticket reservations, including integration with external services.
5. **Rewards System**: Users can exchange points for rewards after ticket purchases.
6. **Ticket Status Checking System**: Allows theater staff to scan QR codes from digital tickets at the theater entrance. The system verifies the ticket's validity by checking its status (valid, expired, or already used) in real-time before granting entry to the movie.

## Payment Processing

The **Payment Processing** system includes integration with external services for generating QR codes for payments and verifying bank slips:

- **PromptPay QR Code Generation**: The system uses [PromptPay.io](https://promptpay.io/) to generate PromptPay QR codes for payment transactions. After the user selects their seats and confirms the booking, a QR code is created using this service to facilitate the payment process.
  
- **Slip Verification**: To ensure authenticity, the system integrates with [SlipOK](https://slipok.com/) for validating user-uploaded payment slips. This ensures that the transaction is completed securely, and only valid slips are accepted by the system.

## Technologies Used

- **Backend**: Developed using Go and the Gin web framework for building REST APIs.
- **Frontend**: Built with React for a dynamic and responsive user interface.
- **Database**: MySQL for data storage, including movies, showtimes, tickets, and user information.
- **QR Code**: Integrated QR code generation and scanning for ticket validation.
- **External Services**: 
  - [PromptPay.io](https://promptpay.io/) for QR code generation.
  - [SlipOK](https://slipok.com/) for payment slip verification.

## Usage

- **User Login**: Users can register and log in to manage their bookings.
- **Ticket Booking**: After logging in, users can select a movie and book seats.
- **QR Code Scanning**: Theater staff can scan the QR code at the theater entrance to validate the ticket.

## Contributors and Responsibilities
- Thannika Mangmee         Responsible for the Ticket Status Checking System.
- Kongsawan Chanburi       Responsible for the Movie Management System.
- Chanyanut Sodsri         Responsible for the Seat Booking System.
- Chanchai Lertsri         Responsible for the Showtime Management System.
- Kamonchanok Thanonndang  Responsible for the Payment Processing System, including integration with PromptPay.io and SlipOK.
- Supatsorn Soisuwan       Responsible for the Rewards System.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

