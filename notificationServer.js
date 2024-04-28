const express = require("express");
require("dotenv").config();
const mysql = require("mysql2");
const cors = require("cors");
const _notificationSender_XMTP = require("./notificationSender_XMTP.js");
const stripe = require("stripe")(process.env.SK_KEY);
const delegatedMint = require("./delegatedMint.js");
const batchTransfer = require("./batchTransfer.js");
const bodyParser = require("body-parser");
const cron = require('node-cron');
const { ethers } = require("ethers");

// Initate app
const app = new express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(
//   cors({
//     origin: [
//       "http://localhost:3000",
//       "http://localhost",
//       "https://portal.3metad.com",
//       "https://uat-portal.3metad.com",
//       "https://games.3metad.com",
//     ],
//   })
// );
// app.use(
//   cors({
//     methods: ["GET", "POST"],
//   })
// );

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost",
      "https://portal.3metad.com",
      "https://uat-portal.3metad.com",
      "https://games.3metad.com",
    ],
    methods: ["GET", "POST"],
  })
);

// SQL Connection
console.log(process.env.SQLHost);
const connection = mysql.createConnection({
  host: 'games.3metad.com',
  user: 'OrcDev',
  password: 'OrcDev2025!',
  database: 'notificationdb',
  port: 3306
});


// Test Route

app.get("/test", (req, res) => {
  res.send("Working");
});

// Query Email by Address

app.get(`/getemail`, (req, res) => {
  try {
    // connection.connect();

    const addy = req.query.addy;
    connection.query(
      `Select * FROM OrcContacts WHERE Address = '${addy}' LIMIT 1; `,
      function (error, results, fields) {
        if (error) throw error;
        res.send(results);
      }
    );
  } catch (error) {
    console.error(error);
  }
  // finally{
  //   connection.end();
  // }
});

// Add Email by Address
app.post(`/addemail`, (req, res) => {
  try {
    const { email, twitter, discord } = req.body;
    const addy = req.query.addy; 

    console.log("Received contact info:", email, twitter, discord); 

    const query = `
      INSERT INTO OrcContacts (Address, email, twitter, discord)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
          email = VALUES(email),
          twitter = VALUES(twitter),
          discord = VALUES(discord);
    `;

    // Execute the query with parameters
    connection.query(query, [addy, email, twitter, discord], (error, results, fields) => {
      if (error) {
        console.error("Failed to insert or update contact info:", error);
        return res.status(500).send('Error saving contact information');
      }
      // Send a success response with results
      res.send(results);
    });
  } catch (error) {
    console.error(`Error in /addemail endpoint: ${error}`);
    res.status(500).send('An error occurred on the server.');
  }
});

//feedback Forms
app.post(`/feedbackForm`, (req, res) => {
  try {
    console.log("Feedback Received:"); // For debugging
    const { gamePackage, gameVersion, feedbackSuggestions,glitchesErrors, newIdeas, likes, dislikes, contactInfo, orcNationHolder, newNFTCollections, newGameIdeas } = req.body;
    
    console.log("Feedback Received:", req.body); // For debugging

    const query = `
      INSERT INTO GameFeedback (gamePackage, gameVersion, feedbackSuggestions, newIdeas, likes, dislikes, contactInfo, orcNationHolder, newNFTCollections, newGameIdeas)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    console.log("Feedback Received:", query); // For debugging

    connection.query(query, [gamePackage, gameVersion, feedbackSuggestions, newIdeas, likes, dislikes, contactInfo, orcNationHolder, newNFTCollections, newGameIdeas], function(error, results, fields) {
      if (error) {
        console.error("Failed to insert feedback:", error);
        res.status(500).send("Error saving feedback");
      } else {
        res.send("Feedback successfully saved");
      }
    });
  } catch (error) {
    console.error("Error in /submitFeedback endpoint:", error);
    res.status(500).send("An error occurred");
  }
});



// Add Highscroe
app.post(`/gamescoresubmit`, (req, res) => {
  try {

    const { wallet, score ,gameType, sessionType } = req.body;
    console.log( score, gameType, sessionType,wallet );  

    const query = `
      INSERT INTO DailyGameScores (wallet, score,gameType, sessionType)
      VALUES (?, ?,?,?)
      ON DUPLICATE KEY UPDATE 
        score = score + VALUES(score);
    `;

    


    // Execute the query with parameters
    connection.query(query, [wallet, score,gameType, sessionType], (error, results, fields) => {
      if (error) {
        console.error(`Failed to submit game score: ${error}`);
        return res.status(500).send('Error saving score');
      }
      // Send a JSON response acknowledging the receipt of the score
      res.json({ received: true, results });
    });
  } catch (error) {
    console.error(`Error in gamescoresubmit: ${error}`);
    res.status(500).send('An error occurred on the server.');
  }
});


// Get all scores
app.get(`/getgamescores`, (req, res) => {
  try {
    const origin = req.headers.origin;
    connection.query(
      `SELECT * FROM HistoricGameScores UNION ALL SELECT * FROM DailyGameScores;`,
      function (error, results, fields) {
        if (error) throw error;
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.send(results);
      }
    );
  } catch (error) {
    console.error(error);
    console.error(`Error in gamescoresubmit: ${error}`);
    res.status(500).send('An error occurred on the server.');
  }
});


// Get Messages
app.get("/xmtp_messages", async (req, res) => {
  try {
    const xmtp_message = await _notificationSender_XMTP.read_xmtp(
      req.query.addy
    );
    // console.log(xmtp_message)
    res.send(xmtp_message);
  } catch (error) {
    console.error(`Error in xmtp_messages: ${error}`);
    res.status(500).send('An error occurred on the server.');
  }
});

// cc payment request
app.post("/create-checkout-session", async (req, res) => {
  const BuyWalletaddress = req.body.wallet;
  const numMints = req.body.numMints;
  switch (delegatedMint.addy_check(BuyWalletaddress)) {
    case true:
      const package = {
        key: "address",
        text: {
          maximum_length: 39,
          minimum_length: 1,
        },
        type: "dropdown",
        label: {
          custom: "Wallet Address",
          type: "custom",
        },
        dropdown: {
          options: [
            {
              label: BuyWalletaddress,
              value: BuyWalletaddress,
            },
          ],
        },
      };
      try {
      const session = await stripe.checkout.sessions.create({
        custom_fields: [package],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Orc Nations NFT",
              },
              unit_amount: 6500,
            },
            quantity: numMints,
          },
        ],
        mode: "payment",
        success_url: `https://portal.3metad.com`,
        cancel_url: `https://portal.3metad.com`,
      });
      res.redirect(303, session.url);
    } catch (error) {
      console.error(`Stripe session creation failed: ${error}`);
      res.status(500).send("Failed to create payment session.");
    }
    break;
  

    case false:
      console.log(`Wrong Address inputed: ${BuyWalletaddress}`);
      res.status(400).send("Invalid wallet address.");
      break;

    default:
      console.log(`Unhandled event type ${BuyWalletaddress}`);
      res.status(500).send("An error occurred.");
  }
});

// mint webhook

app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (request, response) => {
    const event = request.body;
    // const event2 = response.body;
    // console. log(`PaymentIntent was successful! ${event.data.object.items}`);

    // Handle the event
    try {
      switch (event.type) {
        case "checkout.session.completed":
          const checkOut = event.data.object.custom_fields;
          const wallet_addy = checkOut[0].dropdown.value;
          const cs_id = event.data.object.id;
          const lineItems = await stripe.checkout.sessions.listLineItems(cs_id);
          const amount = lineItems.data[0].quantity;
          console.log(`CheckOut Details ${wallet_addy}`);
          delegatedMint.delegatedMint(wallet_addy.toString(),amount);
          break;
        // ... handle other event types
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    }catch (error) {
    
      console.error(`Error in webhook for event type ${event.type}: ${error}`);
      // Log this error or send it to a monitoring system
    }

    // Return a 200 response to acknowledge receipt of the event
    response.json({ received: true });
  }
);

//Update Historical Games table and truncate daily score table
const updateHistoricTable = () => {
  try {
    // connection.connect();
    // const addy = req.query.addy;
    connection.query(
      `INSERT INTO HistoricGameScores
      SELECT * FROM DailyGameScores;`,
      function (error, results, fields) {
        if (error) throw error;
      }
    );
    console.log('Data copied to HistoricGameScores successfully.');
  } catch (error) {
    console.error('Error updating historic table:', error);
  }

}
//Truncate daily score table
const truncateDailyScoreTable = () => {
  try {
    // connection.connect();
    // const addy = req.query.addy;
    connection.query(
      `TRUNCATE TABLE DailyGameScores;`,
      function (error, results, fields) {
        if (error) throw error;
      }
    );
    console.log('DailyGameScores table truncated successfully.');
  } catch (error) {
    console.error('Error truncating DailyGameScores table:', error);
  }
}

// Run daily batch transfer
const batchTransferFunction = () => {
  try {
    // connection.connect();
    // const addy = req.query.addy;
    connection.query(
      `SELECT wallet, score FROM DailyGameScores;`,
      function (error, results, fields) {
        if (error) throw error;
            // Separate columns into individual arrays
    const walletsToPay = [];
    const amountToPay = [];
    results.forEach(row => {
      walletsToPay.push(row.wallet);
      amountToPay.push(ethers.utils.parseEther(row.score.toString()));
    });
    // Run Batch transfer
    batchTransfer.batchTransfer(walletsToPay,amountToPay);
      }
    );
    console.log('Batch transfer successful.');
  } catch (error) {
    console.error('Error in batchTransferFunction:', error);
  }
}

// Schedule batch transfer to run every week at the same time
// cron.schedule('0 0 * * 6', () => {
//   batchTransferFunction();
//   // Schedule tables updates to run 3 minutes after task 1
//   setTimeout(() => {
//     updateHistoricTable();
//     // Schedule table truncate to run 3 minutes after task 2
//     setTimeout(() => {
//       truncateDailyScoreTable();
//         }, 3 * 60 * 1000); // 3 minutes in milliseconds
//       }, 3 * 60 * 1000); // 3 minutes in milliseconds
// });

app.listen(3001, () =>
  console.log(`listening on port ${3001}`)
);

module.exports = {
  connection,
};
