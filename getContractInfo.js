//copyfile.js
const fs = require("fs");

console.log("Copying addresses from Foundry....");

/*  logic to make sure fil path is same and accesible before copying */
// if (fs.existsSync("../OrcNation_v8_smart_contracts/deploymentInfo.json")) {
//   //file exists
//   console.log("v8 file exits");
//   const data = fs.readFileSync(
//     "../OrcNation_v8_smart_contracts/deploymentInfo.json",
//     "utf8"
//   );
//   console.log("v8 content \n" + data);
// }
// if (fs.existsSync("./contract_Info/deploymentInfo.json")) {
//   //file exists
//   console.log("svc file exits");
//   const data = fs.readFileSync("./contract_Info/deploymentInfo.json", "utf8");
//   console.log("svc content \n" + data);
// }

// destination will be created or overwritten by default.
fs.copyFile(
  "../OrcNation_v8_smart_contracts/deploymentInfo.json",
  "./contract_Info/deploymentInfo.json",
  (err) => {
    if (err) throw err;
    console.log("Addresses were copied to destination");
  }
);

console.log("Copying ABIs from Foundry....");

// destination will be created or overwritten by default.

fs.copyFile(
  "../OrcNation_v8_smart_contracts/out/OrcNation.sol/OrcNation.json",
  "./contract_Info/OrcNation.json",
  (err) => {
    if (err) throw err;
    console.log("OrcNation copied to destination");
  }
);

fs.copyFile(
  "../OrcNation_v8_smart_contracts/out/Raffle.sol/Raffle.json",
  "./contract_Info/Raffle.json",
  (err) => {
    if (err) throw err;
    console.log("Raffle copied to destination");
  }
);
