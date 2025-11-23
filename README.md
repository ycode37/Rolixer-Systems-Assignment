STORE RATING PLATFORM

A full-stack web application that allows users to submit and manage ratings for registered stores. 
User access and functionalities depend on their assigned roles.

## TECH STACK USED:
FrontEnd: React.js
BackEnd:  Express.js
DataBase: MySQL

## Objective:
This project was developed as part of a Full Stack Coding Challenge .  
Users can rate stores from 1 to 5 and view ratings submitted by others.  

## Authentication & Authorization

The platform uses JWT-based authentication with role-based access control.
Single login system for Admin, Store Owner, and Normal User .
Admin can create admin and store owner accounts

Password Security
Passwords hashed using bcrypt


## User Roles & Functionalities

 System Administrator
- Add stores, normal users, and admin users
- Dashboard insights:
  - Total Users
  - Total Stores
  - Total Submitted Ratings
- View & filter user and store lists by Name, Email, Address, Role
- View store details including ratings
- Manage accounts & logout

Normal User
- Sign up & login
- View all registered stores
- Search stores by Name or Address
- Submit or update ratings (1–5)
- View store details including:
  - Store Name
  - Address
  - Overall Rating
  - User’s submitted rating
- Update password
- Logout

Store Owner
- Login & update password
- Dashboard displays:
  - Average rating of their store
  - Users who submitted ratings
- Logout

