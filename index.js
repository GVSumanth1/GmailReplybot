// The code utilizes the googleapis package to interact with various Google APIs, specifically focusing on the Gmail API. Authentication is managed through the OAuth2 class from the google.auth module, ensuring secure access to Gmail functionalities. The code employs JavaScript and Node.js to create an automated system for checking unread emails, replying to them with an auto-response, and managing labels within the Gmail interface.

// Detailed specification:

// googleapis: Offers functionality to interact with Google APIs.
// OAuth2 from google.auth: Manages authentication and access tokens for the Gmail API.
// JavaScript: Used as the primary programming language.
// Node.js: Platform for running JavaScript on the server-side.


const { google } = require("googleapis");

/*
I got the ID, secret, and URL from Google's website where I created a project.
The refresh token was created on a different website called OAuth Playground. I authorized access to Gmail's API by entering the ID and secret there. This gave me an authorization code.
I exchanged that authorization code for a refresh token by clicking on an "exchange" button.
Then, I imported this information into my program using a file called userAuth.js.
 */
const {
  Client_Id,
  Client_Secret,
  Redirect_url,
  Refresh_Token,
} = require("./userAuth");

const Client_OAuth2 = new google.auth.OAuth2(
  Client_Id,
  Client_Secret,
  Redirect_url
);
Client_OAuth2.setCredentials({ refresh_token: Refresh_Token });

// Utilizing a new 'set' ensures unique replies to qualifying emails, maintaining a record of users already responded to.
//keep track of users already replied to using AlreadyReplied
const AlreadyReplied = new Set();

//Check for new emails and respond accordingly .
async function Check() {
  try {
    const gmail = google.gmail({ version: "v1", auth: Client_OAuth2 });

    //List of unread.
    const needed = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread",
    });
    const messages = needed.data.messages;

    if (messages) {
      if(messages.length>0){
      
      for (const message of messages) {
          const email = await gmail.users.messages.get({
            userId: "me",
            id: message.id,
          });
          
          
          /* Fetching the recipient's email address and subject from the message headers
          const email = {
          data: {
            payload: {
             headers: [
            {
            name: "From",
            value: "xyz@example.com"
            }
            ]
            }
          }
        };
        */

          const from = email.data.payload.headers.find(
            (header) => header.name === "From"
          );
          const toHeader = email.data.payload.headers.find(
            (header) => header.name === "To"
          );
          const Subject = email.data.payload.headers.find(
            (header) => header.name === "Subject"
          );
          
          const From = from.value;
          const toEmail = toHeader.value;
          const subject = Subject.value;
          
          console.log("mail From", From);
          console.log("to mail", toEmail);
          
          // Verify if a response has already been sent to this user
          if (AlreadyReplied.has(From)) {
            console.log("Already replied to : ", From);
            continue;
          }


          // Replies to mails that have no replies
          
          const thread = await gmail.users.threads.get({
            userId: "me",
            id: message.threadId,
          });

          const replies = thread.data.messages.slice(1);
  
          if (replies.length === 0) {
            // Reply to mail.
            await gmail.users.messages.send({
              userId: "me",
              requestBody: {
                raw: await createReplyRaw(toEmail, From, subject),
              },
            });
  
            // Adding label to mail.
            const labelName = "onVacation";
            await gmail.users.messages.modify({
              userId: "me",
              id: message.id,
              requestBody: {
                addLabelIds: [await createLabelIfNeeded(labelName)],
              },
            });
  
            console.log("Sent reply to email:", From);
            AlreadyReplied.add(From);
          }
        }
      }

    }
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

//base64 encoded email format to prepare the content for email transmission.
// Base64 encoding ensures the proper representation of text, allowing it to be safely sent over email protocols 
// where certain characters might cause issues if not encoded.
async function createReplyRaw(from, to, subject) {
  const emailContent = `From: ${from}\nTo: ${to}\nSubject: ${subject}\n\nThanks for reaching out. I'm currently away but will get back to you at the earliest opportunity.`;
  const base64EncodedEmail = Buffer.from(emailContent)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return base64EncodedEmail;
}

//   Assign a label to the email and relocate it to that labeled category.
async function createLabelIfNeeded(labelName) {
  const gmail = google.gmail({ version: "v1", auth: Client_OAuth2 });
  // Check if the label already exists.
  const needed = await gmail.users.labels.list({ userId: "me" });
  const labels = needed.data.labels;

  const existingLabel = labels.find((label) => label.name === labelName);
  if (existingLabel) {
    return existingLabel.id;
  }

  // Create label(if doesnt exist)
  const newLabel = await gmail.users.labels.create({
    userId: "me",
    requestBody: {
      name: labelName,
      labelListVisibility: "labelShow",
      messageListVisibility: "show",
    },
  });

  return newLabel.data.id;
}

//  Execute steps 1 through 3 repeatedly at irregular intervals
//  ranging from 45 to 120 seconds.
function generateRandomInterval(minValue, maxValue) {
  const range = maxValue - minValue + 1;
  return Math.floor(Math.random() * range) + minValue;
}

function initiateCheckAtRandomIntervals() {
  const minIntervalSeconds = 45;
  const maxIntervalSeconds = 120;

  const randomInterval = generateRandomInterval(minIntervalSeconds, maxIntervalSeconds);
  
  setInterval(Check, randomInterval * 1000);
}

initiateCheckAtRandomIntervals();


// some areas can be enhanced:

// Mark promotions label and try not to respond to it.
// Keep track of metrics for analysis.
// Implement robust error handling to manage various scenarios, ensuring graceful degradation and informative error messages.
// Refactor code to optimize performance, especially in handling large volumes of emails efficiently.
// Ensure sensitive data like credentials and tokens are securely managed, possibly utilizing environment variables or a secure vault.
// Evaluate the code's scalability for handling increased email volumes or concurrent requests.
// Conduct thorough code reviews to identify potential improvements and ensure adherence to best practices.
