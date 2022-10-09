import { AddProposalFormData, ProposalInfo } from "../types/ProposalManagerType";
import ProposalManagerContractConstruct from "./construct/ProposalManager";
import { ethers } from "ethers";
import { errorFunction } from "../contracts/commonFunctions";

import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import proposalManagerAbi from "../contracts/construct/ProposalManager.json";

const blockchainUrl = String(process.env.NEXT_PUBLIC_BLOCKCHAIN_URL) ?? "";
const proposalManagerAddress =
  String(process.env.NEXT_PUBLIC_PROPOSAL_MANAGER_CONTRACT_ADDRESS) ?? "";
const gasLimit = 100000 * 1000000;
const storageDepositLimit = null;

export const getProposalList = async (daoAddress:string): Promise<
  Array<ProposalInfo>
> => {
  const proposalManagerAddress =
    process.env.NEXT_PUBLIC_PROPOSAL_MANAGER_CONTRACT_ADDRESS;
  const contractConstract = ProposalManagerContractConstruct;

  let response: ProposalInfo[] = [];
  if (typeof window.ethereum !== "undefined" && proposalManagerAddress) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      proposalManagerAddress,
      contractConstract.abi,
      signer
    );
    response = await contract
      .getProposalList(daoAddress)
      .catch((err: any) => {
        console.log(err);
        errorFunction(err);
      });
    console.log("### getProposalList Return: ", response);
  }
  return response;
};

export const addProposal =async (
  performingAccount:InjectedAccountWithMeta,
  inputData: AddProposalFormData,
  daoAddress: string
) => {
  const { web3FromSource } = await import("@polkadot/extension-dapp");
  const wsProvider = new WsProvider(blockchainUrl);
  const api = await ApiPromise.create({ provider: wsProvider });

  const contract = new ContractPromise(api, proposalManagerAbi, proposalManagerAddress);
  const injector = await web3FromSource(performingAccount.meta.source);
  const tx = await contract.tx.addProposal(
    { value: 0, gasLimit: -1 }, 
    inputData.proposalKind,
    daoAddress,
    inputData.title,
    inputData.outline,
    inputData.detail,
    inputData.csvData,
  );
  if (injector !== undefined) {
    const unsub = await tx.signAndSend(
      performingAccount.address,
      { signer: injector.signer },
      (result) => {
        if (result.status.isFinalized) {
          unsub();
          api.disconnect();
        }
      }
    );
  }
}


export const doVoteForProposal = async (yes: boolean, proposalId: number,daoAddress:string) => {
  console.log("## doVote:yes: ", yes);
  const proposalManagerAddress =
    process.env.NEXT_PUBLIC_PROPOSAL_MANAGER_CONTRACT_ADDRESS;
  const contractConstract = ProposalManagerContractConstruct;
  let response: ProposalInfo[] = [];
  if (typeof window.ethereum !== "undefined" && proposalManagerAddress) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      proposalManagerAddress,
      contractConstract.abi,
      signer
    );
    response = await contract
      .voteForProposal(daoAddress, proposalId, yes)
      .catch((err: any) => {
        console.log(err);
        errorFunction(err);
      });
    console.log("### voteForProposal Return: ", response);
  }
  return response;
};

export const changeProposalStatus = async (
  proposalStatus: number,
  proposalId: number,
  daoAddress: string
) => {
  console.log("#### changeProposalStatus ####");
  console.log("## Proposal Status: ", proposalStatus);
  console.log("## Proposal Id: ", proposalId);
  const proposalManagerAddress =
    process.env.NEXT_PUBLIC_PROPOSAL_MANAGER_CONTRACT_ADDRESS;
  const contractConstract = ProposalManagerContractConstruct;
  let response: ProposalInfo[] = [];
  if (typeof window.ethereum !== "undefined" && proposalManagerAddress) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      proposalManagerAddress,
      contractConstract.abi,
      signer
    );
    response = await contract
      .changeProposalStatus(daoAddress, proposalId, proposalStatus)
      .catch((err: any) => {
        console.log(err);
        errorFunction(err);
      });
    console.log("### changeProposalStatus Return: ", response);
  }
  return response;
};
