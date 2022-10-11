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

export const getProposalList = async (
  peformanceAddress:string,
  daoAddress:string
): Promise<
  Array<ProposalInfo>
> => {
  const wsProvider = new WsProvider(blockchainUrl);
  const api = await ApiPromise.create({ provider: wsProvider });

  let response: ProposalInfo[] = [];

  const contract = new ContractPromise(
    api,
    proposalManagerAbi,
    proposalManagerAddress
  );
  const { gasConsumed, result, output } =
    await contract.query.getProposalList(peformanceAddress, {
      value: 0,
      gasLimit: -1,
    },
    daoAddress);
  if (output !== undefined && output !== null) {
    let response_json = output.toJSON();
    let json_data = JSON.parse(JSON.stringify(response_json));
    for (let i = 0; i < json_data.length; i++) {
      let item: ProposalInfo = {
        proposalKind: json_data[i].proposalType,
        proposalId: json_data[i].proposalId,
        proposer: json_data[i].proposer,
        title: json_data[i].title,
        outline: json_data[i].outline,
        details: json_data[i].details,
        githubURL: json_data[i].githubUrl,
        proposalStatus: json_data[i].status,
        csvData:json_data[i].csvData,
      };
      response.push(item); 
    }
  }
  api.disconnect();
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
    { value: 0, gasLimit: gasLimit }, 
    inputData.proposalKind,
    daoAddress,
    inputData.title,
    inputData.outline,
    inputData.detail,
    inputData.githubURL,
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

export const doVoteForProposal = async (
  performingAccount: InjectedAccountWithMeta,
  yes: boolean, 
  proposalId: number,
  daoAddress:string
) => {
  const { web3FromSource } = await import("@polkadot/extension-dapp");
  const wsProvider = new WsProvider(blockchainUrl);
  const api = await ApiPromise.create({ provider: wsProvider });

  const contract = new ContractPromise(api, proposalManagerAbi, proposalManagerAddress);
  const injector = await web3FromSource(performingAccount.meta.source);
  const tx = await contract.tx.voteForTheProposal(
    { value: 0, gasLimit: gasLimit },
    daoAddress,
    proposalId,
    yes,
  );
  if (injector !== undefined) {
    const unsub = await tx.signAndSend(performingAccount.address, { signer: injector.signer }, (result) => {
      if (result.status.isFinalized) {
        unsub();
        api.disconnect();
      }
    });
  }
}

export const changeProposalStatus = async (
  performingAccount: InjectedAccountWithMeta,
  proposalStatus: number,
  proposalId: number,
  daoAddress: string
) => {
  const { web3FromSource } = await import("@polkadot/extension-dapp");
  const wsProvider = new WsProvider(blockchainUrl);
  const api = await ApiPromise.create({ provider: wsProvider });

  const contract = new ContractPromise(api, proposalManagerAbi, proposalManagerAddress);
  const injector = await web3FromSource(performingAccount.meta.source);
  console.log("## proposal status:",proposalStatus);
  const tx = await contract.tx.changeProposalStatus(
    { value: 0, gasLimit: gasLimit },
    daoAddress,
    proposalId,
    proposalStatus,
  );
  if (injector !== undefined) {
    const unsub = await tx.signAndSend(performingAccount.address, { signer: injector.signer }, (result) => {
      if (result.status.isFinalized) {
        unsub();
        api.disconnect();
      }
    });
  }
}

export const execute_proposal = async(
  performingAccount: InjectedAccountWithMeta,
  proposalId: number,
  daoAddress: string
) => {
  const { web3FromSource } = await import("@polkadot/extension-dapp");
  const wsProvider = new WsProvider(blockchainUrl);
  const api = await ApiPromise.create({ provider: wsProvider });

  const contract = new ContractPromise(api, proposalManagerAbi, proposalManagerAddress);
  const injector = await web3FromSource(performingAccount.meta.source);
  const tx = await contract.tx.executeProposal(
    { value: 0, gasLimit: gasLimit },
    daoAddress,
    proposalId,
  );
  if (injector !== undefined) {
    const unsub = await tx.signAndSend(performingAccount.address, { signer: injector.signer }, (result) => {
      if (result.status.isFinalized) {
        unsub();
        api.disconnect();
      }
    });
  }

}