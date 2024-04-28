const { MailtrapClient } = require("mailtrap");
require("dotenv").config();


const msg_transport = (email) => {

  const TOKEN = process.env.mailToken;
  const ENDPOINT = process.env.mailENDPOINT;
  
  const client = new MailtrapClient({ endpoint: ENDPOINT, token: TOKEN });
  
  const sender = {
    email: "notification@3metad.com",
    name: "3MetaD Blockchain Alerts",
  };
  const recipients = [
    {
      email: email,
    }
  ];
  
  client
    .send({
      from: sender,
      to: recipients,
      subject: "Congratulations!",
      html: "<h1>View your messgae with 3MetaD at <a href=portal.3metad.com/inbox>3MD Portal</a></h1>"
    })
    .then(console.log, console.error);
  
  }


  module.exports = {
    msg_transport,
  };