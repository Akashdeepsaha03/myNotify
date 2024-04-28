require("dotenv").config();
const { ethers } = require("ethers");
//const {orcNationAbi} = require("./contractInfo/contractConfig.tsx");
const _contractsConfig = require("./contractsConfig");


// check input address
const addy_check = (addy) => {
  const result = ethers.utils.isAddress(addy);
  console.log(result);
  return result;
};

// Replace these values with your actual contract address and ABI
// const contractAddress = process.env.OrcNationAddress;
const contractAddress = _contractsConfig.orcNationAddress;
const contractAbi = _contractsConfig.orcNationAbi;

// Replace these values with your Ethereum node endpoint and private key
const mumbaiNodeUrl = process.env.mumbaiNodeUrl;
const privateKey = process.env.OrcPK;

const delegatedMint = async (toAddress,amount) => {
  // Connect to Ethereum node
  const provider = new ethers.providers.JsonRpcProvider(mumbaiNodeUrl);

  // Create a wallet using the private key
  const wallet = new ethers.Wallet(privateKey, provider);
  // const wallet = Wallet.fromMnemonic(process.env.Mnemonic);

  // Create a contract instance
  const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

  try {
    // Interact with the contract, for example, call a read-only function
    // Get current price
    const calculatePrice = await contract.calculatePrice(amount);
    console.log("Value from the contract:", calculatePrice);

    // If you want to interact with a state-changing function, use sendTransaction
    const tx = await contract.mint(toAddress.toString(), amount, {
      value: calculatePrice.toString(),
    });
    await tx.wait();
    console.log("Transaction hash:", tx.hash);
    return tx.hash;
  } catch (error) {
    console.error("Error interacting with the contract:", error);
  }
};

// //Temp function
// const tempFunc = async () => {
//   // Connect to Ethereum node
//   const provider = new ethers.providers.JsonRpcProvider(mumbaiNodeUrl);

//   // Create a wallet using the private key
//   const wallet = new ethers.Wallet(privateKey, provider);
// // const wallet = Wallet.fromMnemonic(process.env.Mnemonic);

//   // Create a contract instance
//   const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

//   try {
//     // Interact with the contract, for example, call a read-only function
//     // Get current price
//     const calculatePrice = await contract.calculatePrice(1);
//     console.log('Value from the contract:', calculatePrice.toString());

// //     // If you want to interact with a state-changing function, use sendTransaction
//     const tx = await contract.addToWhitelist(['0xDE12A4d649A27e1280ce1a8ceFc0483d38276968','0x03E97aEed206623662d27b3fd3D7BF87cdc37e23']);
//     await tx.wait();
//     console.log('Transaction hash:', tx.hash);
//   } catch (error) {
//     console.error('Error interacting with the contract:', error);
//   }
// }

// tempFunc()

// delegatedMint('0xDE12A4d649A27e1280ce1a8ceFc0483d38276968')

// addy_check('0xDE12A4d649A27e1280ce1a8ceFc0483d38276968')

module.exports = {
  delegatedMint,
  addy_check,
};
