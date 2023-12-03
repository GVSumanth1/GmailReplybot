# GmailReplybot
This repository contains an Auto Reply Gmail Bot developed using Node.js and Google APIs.
The application responds to emails in your Gmail mailbox while you're away, ensuring that you never miss important messages.

Features
Node.js Clusters Support: Utilizes Node.js clusters for better efficiency.
Automated Email Checking: Monitors and checks for new emails in the specified Gmail ID.
Auto-response Mechanism: Sends replies to emails that have not received a prior response.
Label Management: Adds a specific label to emails and relocates them to that labeled category.
Random Interval Check: Conducts the above actions at irregular intervals ranging from 45 to 120 seconds.

Libraries
googleapis: Integrates functionality to interact with various Google APIs, including the Gmail API.
OAuth2: Manages authentication and access tokens for secure interaction with the Gmail API.

Getting Started
Setting Up OAuth 2.0 Authentication:
Go to the Google Cloud Console and create a new project.
Navigate to the "Credentials" tab and create an "OAuth client ID."
Configure the client ID details, including redirect URIs, and obtain the client ID and secret.
Enable the Gmail API for the project.
Visit the OAuth 2.0 Playground and authorize the Gmail API.
Obtain the refresh token from the OAuth 2.0 Playground.

npm install
npm install googleapis nodemon
Replace placeholder values in credentials.js with your obtained credentials:

Replace CLIENT_ID with the client ID value.
Replace CLIENT_SECRET with the client secret value.
Replace REDIRECT_URI with the redirect URI value.
Replace REFRESH_TOKEN with the refresh token value.

npm start
