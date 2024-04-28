const { Client } = require("@xmtp/xmtp-js");
const { Wallet } = require("ethers");
const _notificationSender_SMTP = require("./notificationSender_SMTP");

// Message template
const message_template = "Congratulations on minting the OrcNation NFT!🥳";

// const wallet = Wallet.createRandom();
const Mnemonic='robust crouch miss elbow evolve upper chronic yard velvet solution nominee mean'
const wallet = Wallet.fromMnemonic(Mnemonic);

// Send XMTP Message

const send_xmtp = async (address_to, email) => {
  // Create client
  const xmtp = await Client.create(wallet, { env: "production" });
  // Start a conversation with XMTP
  const conversation = await xmtp.conversations.newConversation(address_to);
  // Send message
  const message = await conversation.send(message_template);
  console.log(`Message sent: "${message.content}"`);
  _notificationSender_SMTP.msg_transport(email);
  return message;
};

// Load XMTP Convo

const read_xmtp = async (address_to) => {
  //Object to hold messages
  var convo = [];
  // Create client
  const xmtp = await Client.create(wallet, { env: "production" });
  // Start a conversation with XMTP
  const conversation = await xmtp.conversations.newConversation(address_to);
  // Load old convo
  for await (const historical_messages of await conversation.messages()) {
    console.log(
      `[${historical_messages.senderAddress}]: ${historical_messages.content}`
    );
    //convo += `[${historical_messages.senderAddress}]: ${historical_messages.content}<br>`;
    convo.push({
      sender: historical_messages.senderAddress,
      content: historical_messages.content,
    });
  }
  return convo;
};

// Test Trigger
// send_xmtp("0xDE12A4d649A27e1280ce1a8ceFc0483d38276968","obafemi.odejayi@gmail.com")

module.exports = {
  send_xmtp,
  read_xmtp,
};
