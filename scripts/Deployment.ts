import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import { Ballot__factory } from "../typechain-types";
dotenv.config();

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

function convertStringArrayToBytes32(array: string[]) {
	const bytes32Array = [];
	for (let index = 0; index < array.length; index++) {
		bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
	}
	return bytes32Array;
}

async function main() {
	const provider = ethers.getDefaultProvider("goerli");
	const accounts = await ethers.getSigners();

	//console.log({accounts});
	const lastBlock = await provider.getBlock("latest");
	//console.log({lastBlock})
	const options = {
		alchemy: process.env.ALCHEMY_API_KEY,
		infura: process.env.INFURA_API_KEY,
	};
	//console.log({options});

	console.log("Deploying Ballot contract");
	console.log("Proposals: ");
	PROPOSALS.forEach((element, index) => {
		console.log(`Proposal N. ${index + 1}: ${element}`);
	});

	const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC ?? "");
	const signer = wallet.connect(provider);
	const balanceBN = await signer.getBalance();
	console.log(signer.address);

	const balance = Number(ethers.utils.formatEther(balanceBN));

	console.log(`Wallet Balance: ${balance}`);

	const ballotFactory = new Ballot__factory(signer);
	const ballotContract = await ballotFactory.deploy(convertStringArrayToBytes32(PROPOSALS));
	await ballotContract.deployed();

	const toDelegateAddress = ethers.Wallet.fromMnemonic(process.env.RESERVE1 ?? "").address;
	const giveRightsTx = await ballotContract.giveRightToVote(toDelegateAddress);
	const giveRightsTxReceipt = await giveRightsTx.wait();
	console.log({ giveRightsTxReceipt });
	const delegateTx = await ballotContract.delegate(toDelegateAddress);
	const delegateTxReceipt = await delegateTx.wait();
	console.log({ delegateTxReceipt });
	const voterDelegated = await ballotContract.voters(toDelegateAddress);
	console.log({ voterDelegated });
	const voterDelegater = await ballotContract.voters(wallet.address);
	console.log({ voterDelegater });

	// const chairperson: string = await ballotContract.chairperson();
	// console.log({chairperson});
	// const vote: number = 2;
	// const voteTx = await ballotContract.vote(vote);
	// const voteTxReceipt = await voteTx.wait()
	// console.log({voteTxReceipt});
	// const giveRightsTx = await ballotContract.giveRightToVote(accounts[3].address);
	// const giveRightsTxReceipt = await giveRightsTx.wait()
	// console.log({giveRightsTxReceipt});

	// const voters = await ballotContract.voters(signer.address);
	// console.log({voters});
	// const proposals = await ballotContract.proposals(vote);
	// console.log({proposals});

	//const proposalsAfterVote = await ballotContract.proposals(vote);
	//console.log({proposalsAfterVote});

	// for (let index = 0; index < PROPOSALS.length; index++) {
	//     const proposal = await ballotContract.proposals(index);
	//     const name = ethers.utils.parseBytes32String(proposal.name);
	//     console.log(index, name, proposal)
	// }

	// const chairperson = await ballotContract.chairperson();
	// console.log({chairperson});
	// console.log({address0: accounts[0].address, address1: accounts[1].address})
	// console.log("Giving right to vote to address1")
	// const giveRightToVoteTx = await ballotContract.giveRightToVote(accounts[1].address);
	// const giveRightToVoteTxReceipt = await giveRightToVoteTx.wait()
	// console.log({giveRightToVoteTxReceipt})
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
