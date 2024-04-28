require("dotenv").config();
const { ethers } = require("ethers");
const _contractsConfig = require("./contractsConfig");


//Contract addresses and ABIs
const contractAddressGov = _contractsConfig.orcTokenGovAddress;
const contractAddressToken = _contractsConfig.orcTokenAddress;
const contractAbi = require("./contract_Info/OrcsTokenGov.json");
// const contractAbi = _contractsConfig.orcTokenGovAbi;
const contractAbi2 = _contractsConfig.orcTokenAbi;

//Node endpoint and private key
const ZKSyncSepoliaNodeUrl = process.env.ZKSyncSepoliaNodeUrl;
const privateKey = process.env.OrcPK_ZK;

const batchTransfer = async (toAddress,amount) => {

  // Connect to ZK node
  const provider = new ethers.providers.JsonRpcProvider(ZKSyncSepoliaNodeUrl);

  // Create a wallet using the private key
  const wallet = new ethers.Wallet(privateKey, provider);
  // const wallet = Wallet.fromMnemonic(process.env.Mnemonic);

  // Create contract instances
  const contractGov = new ethers.Contract(contractAddressGov, contractAbi, wallet);
  const contractToken = new ethers.Contract(contractAddressToken, contractAbi2, wallet);

  try {

    // Interact with a state-changing function
    const calldata = contractToken.interface.encodeFunctionData("batchTransfer",[toAddress,amount]);
    const tx = await contractGov.proposeTransaction(contractAddressToken,0,calldata);
    await tx.wait();
    console.log("Transaction hash:", tx.hash);
    return tx.hash;
  } catch (error) {
    console.error("Error interacting with the contract:", error);
  }
};

// testing section

// batchTransfer(['0x97CbcDCa693BD6f38f49Be405b04344D835052c3','0x97CbcDCa693BD6f38f49Be405b04344D835052c3'],[ethers.utils.parseEther("20"),ethers.utils.parseEther("45")])

module.exports = {
  batchTransfer
};
