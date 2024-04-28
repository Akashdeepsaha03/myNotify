"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.viemclient = void 0;
var _viem = require("viem");
var polygonMumbai = require("viem/chains");
var localhost = require("viem/chains");

const _contractsConfig = require("./contractsConfig");
const _notificationServer = require("./notificationServer");
var _notificationSender_XMTP = require("./notificationSender_XMTP");
// const mysql = require("mysql2");

var pmatic = Object.assign(polygonMumbai, {
  id: 80001,
  rpcUrls: {
    default: {
      http: ["https://rpc.ankr.com/polygon_mumbai"],
    },
    public: {
      http: ["https://rpc-mumbai.maticvigil.com"],
    },
  },
  name: "polygonMatic",
});
// const foundry = {
//   ...localhost,
//   id: 31337,
//   name: "Foundry",
// };
const viemclient = _viem.createPublicClient({
  chain: pmatic, //change to foundry network in case testing using anvil
  transport: _viem.http(),
});

// // const getRaffleDrawn = async (threshold) => {
// //   const data = await viemclient.readContract({
// //     ..._contractsConfig.raffleConfig,
// //     functionName: "raffleDrawn",
// //     args: [threshold],
// //   });
// //   return data;
// // };

// // const getRaffleWinners = async (threshold) => {
// //   const data = await viemclient.readContract({
// //     ..._contractsConfig.raffleConfig,
// //     functionName: "getRaffleWinners",
// //     args: [threshold],
// //   });
// //   return data;
// // };

// // ///code to get the current threshold
// // //activethresholdindex will have index of where the raffle stage is
// // let activethresholdindex = 0;
// // const thresholds = [2000, 4000, 6000, 10000];

// // (async () => {
// //   for (let i = 0; i < thresholds.length; ++i) {
// //     const drawn = await getRaffleDrawn(thresholds[i]);
// //     if (!drawn) break;
// //     activethresholdindex = i;
// //   }
// // })();

// // //this event is used to listen when raffle winner is selected
// // // once winner is selected get email of that addres from sql db
// // // send email to winner - not tested code , it is not decided which event name we should listen to
// // const unwatch = viemclient.watchContractEvent({
// //   address: _contractsConfig.orcNationConfig.address,
// //   abi: _contractsConfig.orcNationConfig.abi,
// //   eventName: "RaffleWinningsTransferred",
// //   onLogs: async (logs) => {
// //     console.log(`Transfer event raised at ${new Date()} other logs ${logs}`);
// //     let winners = await getRaffleWinners(thresholds[activethresholdindex]);

// Test version of lines above
const unwatch = viemclient.watchContractEvent({
  address: _contractsConfig.orcNationConfig.address,
  abi: _contractsConfig.orcNationConfig.abi,
  eventName: "Transfer",
  onLogs: async (logs) => {
    // const clean_logs = await viemclient.getFilterLogs({ logs })
    // _notificationSender_XMTP.send_xmtp("0xDE12A4d649A27e1280ce1a8ceFc0483d38276968","obafemi.odejayi@gmail.com")
    let transferevt = logs.filter((evt) => evt.eventName == "Transfer");
    if (transferevt.length === 0) {
      console.log("No transfer events found.");
    }
    console.log("num of trasnfers ", transferevt.length, transferevt);
    let args = transferevt[0]["args"];

    let onewinner = args["to"];
    try {
      _notificationServer.connection.query(
        `SELECT Email FROM OrcContacts WHERE Address IN ('${onewinner}') ORDER BY ID DESC LIMIT 1;`,
        function (error, results, fields) {
          if (error) throw error;
          //send email to
          if (results && results.length > 0) {
            let emailaddress = results[0].Email;
            console.log(`email is sent to (${emailaddress}) `);
            //invoke send email
            _notificationSender_XMTP.send_xmtp(onewinner, emailaddress);
          }
        }
      );
    } catch (error) {
      console.error(`Error handling Transfer event for address ${onewinner}:`, error);
    } // console.log(`Transfer event raised at ${new Date()} other logs ${logs.toString()}`);
    // return;
  },
});

const unwatchRaffleWinners = viemclient.watchContractEvent({
  address: _contractsConfig.raffleConfig.address,
  abi: _contractsConfig.raffleConfig.abi,
  eventName: "RaffleWinnersSelected",
  onLogs: async (logs) => {
    try {
      let winnerSelectedEvt = logs.filter(
        (evt) => evt.eventName == "RaffleWinnersSelected"
      );
      if (winnerSelectedEvt.length === 0) {
        console.error("No RaffleWinnersSelected events found in logs.");
        
      }
      let args = winnerSelectedEvt[0]["args"];
      console.log(`RaffleWinnersSelected args : ${args}`);
      let winners = args["winners"];
      if (!winners || winners.length === 0) {
        console.log("No winners found in the RaffleWinnersSelected event.");
        
      }
      console.log(`winners selected : ${winners}`);
      for (onewinner in winners) {
        try {
          _notificationServer.connection.query(
            `SELECT Email FROM OrcContacts WHERE Address IN ('${onewinner}') ORDER BY ID DESC LIMIT 1;`,
            function (error, results, fields) {
              if (error) throw error;
              //send email to
              if (results && results.length > 0) {
                let emailaddress = results[0].Email;
                console.log(
                  `raffle winner selected email is sent to (${emailaddress}) `
                );
                //invoke send email
                _notificationSender_XMTP.send_xmtp(onewinner, emailaddress);
              }
              else {
                console.log(`No email found for winner: ${onewinner}`);
              }
    
            }
          );
        } catch (error) {
          console.error(`Error sending notification to winner: ${error}`);
        }
      }
    } catch (err) {
      console.error(`Error occurred in RaffleWinnersSelected event listener: ${err}`);
    }
  },
});
