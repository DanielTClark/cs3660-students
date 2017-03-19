# cs3660-students
A project to fetch and display student data. Updated for Web Programming 3

This project is a toy app to demonstrate my ability to use Angular and Angular Material
along with Node to make a functioning web app.

## Features
The data table view supports sorting, editing and deletion.

The cards view, with the latest version, supports editing and deletion.

Cookies are used to save which view the user was at last.

Both views support adding new students and restoring deleted ones.

All operations on the students, including the initial load are done through a RESTful interface with Node.

## How to set up and run

1. Download Node.js 6.3 or greater.
2. Clone repository
3. Navigate to local folder and run npm install.
4. Run nodeserver.js. (Default port is 80, but can be changed with the PORT environment variable.)
5. Navigate browser to localhost on the port you provided
