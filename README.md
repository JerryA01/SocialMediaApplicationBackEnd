## SocialMediaApplication

Here i have created a Social Media Application for university students named Chirrup. It allows students to create an account and login to engage with other students via post's. 
This consists of a frontend and a backend which run Jointly. The backend server needs to be ran first before running the front end. Once this is running the front end repository is on my Github with instructions on how to run it.

## Table of Contents
- [Overview] (#Overview)
- [Video walkthrough of the application] (#Walkthrough)
- [Video walkthrough on how to install and use this on your local machine] (#HowToUseVideo)
- [Installation&Usage] (#installation&Usage)
  

## Overview

I programmed a Full Stack Application which is a social media application named Chirrup. Here you can follow users, create posts and engage with people's posts by liking them, updating them and many more. 

I did this in Javascript with the help of using the NodeJs framework and libraries from the NodeJS framework like express, Joi for validation and SQLite for database management. 

I used the VUE framework for my front end and used the bootstrap style framework for the UX - User Experience.

This was programmed to a predefined specification which is here https://app.swaggerhub.com/apis/MMU-SE/Chirrup/1.0.0/#/

I used the RESTful API for communications between the front end and the backend. Using the fetch library to handle API requests in the frontend.

For the backend I interacted with the database using the SQLite DB library. I structred this using the MVC structure pattern to make it look more proffesional, seperating the backend into three interconnected elements view, controller and model.

With the help of the Joi Library and access tokens i handled authentication and authorization. This ensured only logged in users can create posts, edit posts and enage with other people like follow them or like their posts.
I implemented profanity filters on the backend for posts to ensure any offensive language does not make it into the application.


🛠️ Tech Stack
Backend:
-Node.js
-Express.js
-SQLite
-Joi (validation)
-CORS
-Morgan
-Body-parser

Frontend:
-Vue.js
-Vite
-Bootstrap 5
-Font Awesome
-HTML5, CSS3

Architecture:
-MVC pattern
-RESTful API


## Walkthrough

https://www.youtube.com/watch?v=e2Op1XRsc7Q&list=PL9IcuQG2EKM1SyWShtdSMBJAEPEviD7Ti&index=1&t=6s


## HowToUseVideo

https://www.youtube.com/watch?v=aOoWgRKTkuA&list=PL9IcuQG2EKM1SyWShtdSMBJAEPEviD7Ti&index=2&t=13s



## installation&Usage
Instructions - Refer to the ##HowToUseVideo if you are having difficulty.

Create a folder 

cd into that folder in your IDE'S terminal

git clone https://github.com/JerryA01/SocialMediaApplicationBackEnd.git

cd into the SocialMediaApplicationBackEnd folder

type "npm run dev" to run the application

Backend application should now be running. 

Now, we have this running we can now run the front end. The front end repository is on my Github with instructions on how to run it.
