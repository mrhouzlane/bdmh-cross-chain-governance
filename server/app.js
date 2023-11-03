require('dotenv').config();
const ethers = require('ethers');
const fetch = require('node-fetch');

// Load environment variables
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PROVIDER_URL = process.env.PROVIDER_URL;
const START_BLOCK = parseInt(process.env.START_BLOCK, 10);
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

if (!CONTRACT_ADDRESS || !PROVIDER_URL || isNaN(START_BLOCK) || !DISCORD_WEBHOOK_URL) {
  console.error('Please make sure your .env file is properly configured with all required variables.');
  process.exit(1);
}

const CONTRACT_ABI = require('./abi.json');

const provider = new ethers.providers.WebSocketProvider(PROVIDER_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

const postToDiscord = async (message) => {
  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message })
    });
    console.log('Sent notification to Discord.');
  } catch (error) {
    console.error('Error sending notification to Discord:', error);
  }
};

const listenForNewProposals = () => {
  contract.on('ProposalCreated', async (proposalId, proposer, targets, values, signatures, calldatas, startBlock, endBlock, description) => {
    console.log("New Proposal Created Event:");
    const proposalIdString = proposalId.toString(); // Convert BigNumber to string
    console.log(`Proposal ID: ${proposalIdString}`);
    console.log(`Proposer: ${proposer}`);
    console.log(`Description: ${description}`);

    const discordMessage = `📢 New Proposal Created:\nProposal ID: ${proposalIdString}\nProposer: ${proposer}\nDescription: ${description}`;
    await postToDiscord(discordMessage);
  });
};

listenForNewProposals();
console.log(`Listening for ProposalCreated events from contract at ${CONTRACT_ADDRESS} starting from block ${START_BLOCK}`);
