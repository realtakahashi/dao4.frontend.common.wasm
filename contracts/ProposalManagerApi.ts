import {
  AddProposalFormData,
  ProposalInfo,
} from "../types/ProposalManagerType";

import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import proposalManagerAbi from "../contracts/construct/ProposalManager.json";
import { checkEventsAndInculueError } from "./contract_common_util";
import { BN } from "@polkadot/util";

const proposalManagerAddress =
  String(process.env.NEXT_PUBLIC_PROPOSAL_MANAGER_CONTRACT_ADDRESS) ?? "";
// const gasLimit = 100000 * 1000000;
const storageDepositLimit = null;

export const getProposalList = async (
  api:any,
  peformanceAddress: string,
  daoAddress: string
): Promise<Array<ProposalInfo>> => {
  let response: ProposalInfo[] = [];
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const contract = new ContractPromise(
    api,
    proposalManagerAbi,
    proposalManagerAddress
  );
  const { gasConsumed, result, output } = await contract.query.getProposalList(
    peformanceAddress,
    {
      value: 0,
      gasLimit: gasLimit,
    },
    daoAddress
  );
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
        csvData: json_data[i].csvData,
      };
      response.push(item);
    }
  }
  return response;
};

const PROPOSAL_KIND_CHANGE_ELECTORAL_COMMISSIONER = 2;

export const addProposal = async (
  api:any,
  performingAccount: InjectedAccountWithMeta,
  inputData: AddProposalFormData,
  daoAddress: string
) => {
  const { web3FromSource } = await import("@polkadot/extension-dapp");
  const contract = new ContractPromise(
    api,
    proposalManagerAbi,
    proposalManagerAddress
  );
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  let isLimitTnure: boolean = false;
  const { gasConsumed, result, output } =
    await contract.query.isLimitTenureCountOfElectoralCommissioner(
      performingAccount.address,
      {
        value: 0,
        gasLimit: gasLimit,
      },
      daoAddress
    );
  if (output !== undefined && output !== null) {
    isLimitTnure = output.toHuman()?.toString() == "true";
  }

  switch (inputData.proposalKind) {
    case PROPOSAL_KIND_CHANGE_ELECTORAL_COMMISSIONER:
      if (isLimitTnure == false) {
        alert("The term of office of the Election Commission has not expired.");
        return;
      }
      break;
    default:
      if (isLimitTnure == true) {
        alert(
          "The term of office of the Election Commission has expired. Propose renewal of the committee."
        );
        return;
      }
  }

  const injector = await web3FromSource(performingAccount.meta.source);
  const tx = await contract.tx.addProposal(
    { value: 0, gasLimit: gasLimit },
    inputData.proposalKind,
    daoAddress,
    inputData.title,
    inputData.outline,
    inputData.detail,
    inputData.githubURL,
    inputData.csvData
  );
  if (injector !== undefined) {
    const unsub = await tx.signAndSend(
      performingAccount.address,
      { signer: injector.signer },
      ( { status, events = [] } ) => {
        if (status.isFinalized) {
          if (checkEventsAndInculueError(events)) {
            alert("Transaction is failure.");
          }
          unsub();
        }
      }
    );
  }
};

export const doVoteForProposal = async (
  api:any,
  performingAccount: InjectedAccountWithMeta,
  yes: boolean,
  proposalId: number,
  daoAddress: string
) => {
  const { web3FromSource } = await import("@polkadot/extension-dapp");

  const contract = new ContractPromise(
    api,
    proposalManagerAbi,
    proposalManagerAddress
  );
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const injector = await web3FromSource(performingAccount.meta.source);
  const tx = await contract.tx.voteForTheProposal(
    { value: 0, gasLimit: gasLimit },
    daoAddress,
    proposalId,
    yes
  );
  if (injector !== undefined) {
    const unsub = await tx.signAndSend(
      performingAccount.address,
      { signer: injector.signer },
      ( {status, events = []} ) => {
        if (status.isFinalized) {
          if (checkEventsAndInculueError(events)) {
            alert("Transaction is failure.");
          }
          unsub();
        }
      }
    );
  }
};

export const changeProposalStatus = async (
  api:any,
  performingAccount: InjectedAccountWithMeta,
  proposalStatus: number,
  proposalId: number,
  daoAddress: string
) => {
  const { web3FromSource } = await import("@polkadot/extension-dapp");

  const contract = new ContractPromise(
    api,
    proposalManagerAbi,
    proposalManagerAddress
  );
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const injector = await web3FromSource(performingAccount.meta.source);
  console.log("## proposal status:", proposalStatus);
  const tx = await contract.tx.changeProposalStatus(
    { value: 0, gasLimit: gasLimit },
    daoAddress,
    proposalId,
    proposalStatus
  );
  if (injector !== undefined) {
    const unsub = await tx.signAndSend(
      performingAccount.address,
      { signer: injector.signer },
      ({ status, events = []} ) => {
        if (status.isFinalized) {
          if (checkEventsAndInculueError(events)) {
            alert("Transaction is failure.");
          }
          unsub();
        }
      }
    );
  }
};

export const execute_proposal = async (
  api:any,
  performingAccount: InjectedAccountWithMeta,
  proposalId: number,
  daoAddress: string
) => {
  const { web3FromSource } = await import("@polkadot/extension-dapp");

  const contract = new ContractPromise(
    api,
    proposalManagerAbi,
    proposalManagerAddress
  );
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const injector = await web3FromSource(performingAccount.meta.source);
  console.log("### execute proposal daoAddress:", daoAddress);
  console.log("### execute proposal proposalId:", proposalId);

  const tx = await contract.tx.executeProposal(
    { value: 0, gasLimit: gasLimit },
    daoAddress,
    proposalId
  );
  if (injector !== undefined) {
    const unsub = await tx.signAndSend(
      performingAccount.address,
      { signer: injector.signer },
      ({ status, events = [] } ) => {
        if (status.isFinalized) {
          console.log("### proposal is executed events:", events);
          if (checkEventsAndInculueError(events)) {
            alert("Transaction is failure.");
          }
          unsub();
        }
      }
    );
  }
};
