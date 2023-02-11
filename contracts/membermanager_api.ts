import {
  FirstMemberData,
  MemberFormDataForDao,
  MemberInfo,
  MemberInfoPlus,
  ProposalData4AddingMember,
  PropsalData4ElectionComission,
} from "../types/MemberManagerType";

import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import memberManagerAbi from "../contracts/construct/MemberManager.json";
import { addProposal } from "./ProposalManagerApi";
import {
  AddProposalData,
  AddProposalFormData,
} from "../types/ProposalManagerType";
import { checkEventsAndInculueError } from "./contract_common_util";
import { BN } from "@polkadot/util";

const memberManagerAddress =
  String(process.env.NEXT_PUBLIC_MEMBER_MANAGER_CONTRACT_ADDRESS) ?? "";
const proposalManagerAddress =
  String(process.env.NEXT_PUBLIC_PROPOSAL_MANAGER_CONTRACT_ADDRESS) ?? "";
// const gasLimit = 100000 * 1000000;
const storageDepositLimit = null;

export const getMemberList = async (
  api:any,
  peformanceAddress: string,
  daoAddress: string
): Promise<Array<MemberInfoPlus>> => {
  let response: MemberInfoPlus[] = [];

  const contract = new ContractPromise(
    api,
    memberManagerAbi,
    memberManagerAddress
  );
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 6219235328,
    proofSize: 131072,
  });

  const { gasConsumed, result, output } = await contract.query.getMemberList(
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
      let item: MemberInfoPlus = {
        name: json_data[i].name,
        eoaAddress: json_data[i].memberAddress,
        memberId: Number(json_data[i].memberId),
        tokenId: 0,
        isElectionCommition: Boolean(json_data[i].isElectoralCommissioner),
      };
      response.push(item);
    }
  }
  return response;
};

export const checkElectionComission = async (
  api:any,
  peformanceAddress: string,
  daoAddress: string
): Promise<boolean> => {
  let response: boolean = false;
  const memberManagerContract = new ContractPromise(
    api,
    memberManagerAbi,
    memberManagerAddress
  );
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 6219235328,
    proofSize: 131072,
  });

  const { gasConsumed, result, output } =
    await memberManagerContract.query.isElectoralCommissioner(
      peformanceAddress,
      {
        value: 0,
        gasLimit: gasLimit,
      },
      daoAddress
    );

  if (output !== undefined && output !== null) {
    if (output.toHuman()?.toString() == "true") {
      response = true;
    } else {
      response = false;
    }
  }
  return response;
};

export const addFirstMember = async (
  api:any,
  performingAccount: InjectedAccountWithMeta,
  _memberFormData: FirstMemberData,
  daoAddress: string,
  setFinished: (value: boolean) => void
) => {
  const { web3FromSource } = await import("@polkadot/extension-dapp");
  const contract = new ContractPromise(
    api,
    memberManagerAbi,
    memberManagerAddress
  );
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 6219235328,
    proofSize: 131072,
  });

  const injector = await web3FromSource(performingAccount.meta.source);
  const tx = await contract.tx.addFirstMember(
    { value: 0, gasLimit: gasLimit },
    daoAddress,
    performingAccount.address,
    _memberFormData.ownerName,
    0
  );
  if (injector !== undefined) {
    const unsub = await tx.signAndSend(
      performingAccount.address,
      { signer: injector.signer },
      ({ status, events = [] }) => {
        if (status.isFinalized) {
          if (checkEventsAndInculueError(events)) {
            alert("Transaction is failure.");
          }
          setFinished(true);
          unsub();
        }
      }
    );
  }
};

export const propose4AddingTheMember = async (
  api:any,
  performingAccount: InjectedAccountWithMeta,
  proposalData: ProposalData4AddingMember,
  daoAddress: string
) => {
  const csvData =
    proposalData.name +
    "," +
    proposalData.memberAddress +
    "," +
    "0" +
    "," +
    "0" +
    "," +
    "false";
  const proposalParameter: AddProposalFormData = {
    proposalKind: proposalData.proposalKind,
    title: proposalData.title,
    outline: proposalData.outline,
    githubURL: proposalData.githubURL,
    detail: proposalData.detail,
    csvData: csvData,
  };
  await addProposal(api,performingAccount, proposalParameter, daoAddress);
};

export const Proposal4ResetElectionComission = async (
  api:any,
  performingAccount: InjectedAccountWithMeta,
  proposalData: PropsalData4ElectionComission,
  daoAddress: string
) => {
  let csvData = proposalData.candidateEoa_one;
  if (proposalData.candidateEoa_two != ""){
    csvData = csvData + "," + proposalData.candidateEoa_two;
  }
  const proposalParameter: AddProposalFormData = {
    proposalKind: proposalData.proposalKind,
    title: proposalData.title,
    outline: proposalData.outline,
    githubURL: proposalData.githubURL,
    detail: proposalData.detail,
    csvData: csvData,
  };
  await addProposal(api,performingAccount, proposalParameter, daoAddress);
};

export const propose4DeletingTheMember = async (
  api:any,
  performingAccount: InjectedAccountWithMeta,
  memberInfoData: MemberInfo,
  proposalData: AddProposalData,
  daoAddress: string
) => {
  const csvData = memberInfoData.eoaAddress;
  const proposalParameter: AddProposalFormData = {
    proposalKind: proposalData.proposalKind,
    title: proposalData.title,
    outline: proposalData.outline,
    githubURL: proposalData.githubURL,
    detail: proposalData.detail,
    csvData: csvData,
  };
  console.log("## delete proposal. parameter:", proposalParameter);
  await addProposal(api,performingAccount, proposalParameter, daoAddress);
};
