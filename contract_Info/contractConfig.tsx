const orcNation = require("./OrcNation.json");
const raffle = require("./Raffle.json");

const orcNationAbi = orcNation.abi;
const raffleAbi = raffle.abi;

module.exports = {
  orcNationAbi,
  raffleAbi,
};
