// import { getAddress } from "viem";
// import deployments from "./contract_Info/deploymentInfo.json";
// import orcNation from "./contract_Info/OrcNation.json";
// import raffle from "./contract_Info/Raffle.json";

// export const orcNationAddress = getAddress(deployments.OrcNationAddress);

// export const raffleAddress = getAddress(deployments.RaffleAddress);

// export const orcNationAbi = orcNation.abi;

// export const raffleAbi = raffle.abi;

// export const orcNationConfig = {
//   address: orcNationAddress,
//   abi: orcNationAbi,
// };

// export const raffleConfig = {
//   address: raffleAddress,
//   abi: raffleAbi,
// };

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.raffleConfig =
  exports.orcNationConfig =
  exports.raffleAbi =
  exports.orcNationAbi =
  exports.raffleAddress =
  exports.orcNationAddress =
  exports.orcTokenAddress =
  exports.orcTokenGovAddress =
    undefined;

var _viem = require("viem");

var _deploymentInfo = require("./contract_Info/deploymentInfo.json");

var _deploymentInfo2 = _interopRequireDefault(_deploymentInfo);

var _OrcNation = require("./contract_Info/OrcNation.json");

var _OrcNation2 = _interopRequireDefault(_OrcNation);

var _OrcToken = require("./contract_Info/OrcsTokenAbi.json");

var _OrcToken2 = _interopRequireDefault(_OrcToken);

var _OrcsTokenGov = require("./contract_Info/OrcsTokenGov.json");

var _OrcsTokenGov2 = _interopRequireDefault(_OrcsTokenGov);

var _Raffle = require("./contract_Info/Raffle.json");

var _Raffle2 = _interopRequireDefault(_Raffle);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var orcNationAddress = (exports.orcNationAddress = (0, _viem.getAddress)(
  _deploymentInfo2.default.mumbai.OrcNation
));

var orcTokenAddress = (exports.orcTokenAddress = (0, _viem.getAddress)(
  _deploymentInfo2.default.zkSepolia.OrcToken
));

var orcTokenGovAddress = (exports.orcTokenGovAddress = (0, _viem.getAddress)(
  _deploymentInfo2.default.zkSepolia.Governor
));

var raffleAddress = (exports.raffleAddress = (0, _viem.getAddress)(
  _deploymentInfo2.default.mumbai.Raffle
));

var orcNationAbi = (exports.orcNationAbi = _OrcNation2.default.abi);

var orcTokenAbi = (exports.orcTokenAbi = _OrcToken2.default.abi);

var orcTokenGovAbi = (exports.orcTokenGovAbi = _OrcsTokenGov2.default.abi);

var raffleAbi = (exports.raffleAbi = _Raffle2.default.abi);

var orcNationConfig = (exports.orcNationConfig = {
  address: orcNationAddress,
  abi: orcNationAbi,
});

var orcTokenConfig = (exports.orcTokenConfig = {
  address: orcTokenAddress,
  abi: orcTokenAbi,
});

var orcTokenGovConfig = (exports.orcTokenGovConfig = {
  address: orcTokenGovAddress,
  abi: orcTokenGovAbi,
});

var raffleConfig = (exports.raffleConfig = {
  address: raffleAddress,
  abi: raffleAbi,
});
