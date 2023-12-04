import { useState } from 'react'
import './App.css'
import Web3 from 'web3';

import { MetaMaskInpageProvider } from "@metamask/providers";

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider
    web3: any
  }
}

interface Candidate {
  id: number;
  name: string;
  votes: number;
}

function App() {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const abi = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "_candidateId", "type": "uint256" }], "name": "VoteSubmitted", "type": "event" }, { "inputs": [{ "internalType": "string", "name": "_name", "type": "string" }], "name": "addCandidate", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "getCandidates", "outputs": [{ "components": [{ "internalType": "uint256", "name": "id", "type": "uint256" }, { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "uint256", "name": "votes", "type": "uint256" }], "internalType": "struct SimpleElection.Candidate[]", "name": "", "type": "tuple[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }], "name": "vote", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]
  const address = "0xe4d4caf259ecc8b96257a43bbeaf15ebed065872"

  const connect = async () => {
    if (window.ethereum) {
      let addresses = await window.ethereum.request({ method: 'eth_requestAccounts' });
      window.web3 = new Web3(window.ethereum);
      if (addresses && Array.isArray(addresses)) {
        setAddresses(addresses);
        getCandidates();
      }
    }
  }

  const getCandidates = async () => {
    const contract = new window.web3.eth.Contract(abi, address);
    let candidates = await contract.methods.getCandidates().call();
    setCandidates(candidates)
    console.log(candidates)

    contract.events.VoteSubmitted()
      .on('data', function (event: any) {
        console.log(event);
        getCandidates();
      })
  }

  const vote = async (id: number) => {
    const contract = new window.web3.eth.Contract(abi, address);

    contract.methods.vote(id).send({ from: addresses[0] }).then(function (result: any) {
      console.log(result);
    })
  }

  return (
    <>
      {
        addresses.length === 0 &&
        <div>
          <p>Please log in using your MetaMask wallet.</p>
          <button id="connect" onClick={connect}>Connect to MetaMask</button>
        </div>
      }
      {
        addresses.length > 0 &&
        <p id="connectedAddress">Connected address: {addresses[0]}</p>
      }
      {
        candidates.length > 0 &&
        candidates.map((candidate, i) => (
          <p key={i}>
            {candidate.name}
            <br />
            Votes: {Number(candidate.votes)}
            <br />
            <button onClick={() => vote(Number(candidate.id))}>Vote</button>
          </p>
        ))
      }

    </>
  )
}

export default App
