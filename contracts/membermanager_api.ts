import {
  FirstMemberData,
  MemberFormDataForDao,
  MemberInfo,
  MemberInfoPlus,
  ProposalData4AddingMember,
  PropsalData4ElectionComission,
} from "../types/MemberManagerType";
import MemberManagerContractConstruct from "./construct/MemberManager";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { errorFunction } from "./commonFunctions";
import { checkNFTMinted } from "./member_nft_api";
import SubDAOContractConstruct from "./construct/SubDAOContractConstruct";

import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import memberManagerAbi from "../contracts/construct/MemberManager.json";
import { addProposal } from "./ProposalManagerApi";
import { AddProposalData, AddProposalFormData } from "../types/ProposalManagerType";

const blockchainUrl = String(process.env.NEXT_PUBLIC_BLOCKCHAIN_URL) ?? "";
const memberManagerAddress =
  String(process.env.NEXT_PUBLIC_MEMBER_MANAGER_CONTRACT_ADDRESS) ?? "";
  const proposalManagerAddress =
  String(process.env.NEXT_PUBLIC_PROPOSAL_MANAGER_CONTRACT_ADDRESS) ?? "";
const gasLimit = 100000 * 1000000;
const storageDepositLimit = null;

export const getMemberList =async (peformanceAddress:string, daoAddress:string): Promise<Array<MemberInfoPlus>> => {
  const wsProvider = new WsProvider(blockchainUrl);
  const api = await ApiPromise.create({ provider: wsProvider });

  let response: MemberInfoPlus[] = [];

  const contract = new ContractPromise(
    api,
    memberManagerAbi,
    memberManagerAddress
  );
  const { gasConsumed, result, output } =
    await contract.query.getMemberList(peformanceAddress, {
      value: 0,
      gasLimit: -1,
    },
    daoAddress);
  if (output !== undefined && output !== null) {
    let response_json = output.toJSON();
    let json_data = JSON.parse(JSON.stringify(response_json));
    for (let i = 0; i < json_data.length; i++) {
      let item: MemberInfoPlus = {
        name: json_data[i].name,
        eoaAddress:json_data[i].memberAddress,
        memberId:Number(json_data[i].memberId),
        tokenId:0,
        isElectionCommition:Boolean(json_data[i].isElectoralCommissioner),
      };
      response.push(item); 
    }
  }
  api.disconnect();
  return response;
}


export const checkElectionComission = async (
  peformanceAddress: string,
  daoAddress: string
): Promise<boolean> => {
  let response: boolean = false;
  const wsProvider = new WsProvider(blockchainUrl);
  const api = await ApiPromise.create({ provider: wsProvider });
  const memberManagerContract = new ContractPromise(
    api,
    memberManagerAbi,
    memberManagerAddress
  );
  const { gasConsumed, result, output } =
    await memberManagerContract.query.isElectoralCommissioner(
      peformanceAddress,
      {
        value: 0,
        gasLimit: -1,
      },
      daoAddress
    );

  if (output !== undefined && output !== null) {
    if (output.toHuman()?.toString() == "true") {
      response = true;
    } else {
      response = false;
    }
  };
  api.disconnect();
  return response;
};

export const addFirstMember = async (
  performingAccount: InjectedAccountWithMeta,
  _memberFormData: FirstMemberData,
  daoAddress: string,
  setFinished:(value:boolean) => void
) => {
  const { web3FromSource } = await import("@polkadot/extension-dapp");
  const wsProvider = new WsProvider(blockchainUrl);
  const api = await ApiPromise.create({ provider: wsProvider });

  const contract = new ContractPromise(api, memberManagerAbi, memberManagerAddress);
  const injector = await web3FromSource(performingAccount.meta.source);
  const tx = await contract.tx.addFirstMember(
    { value: 0, gasLimit: gasLimit },
    daoAddress,
    performingAccount.address,
    _memberFormData.ownerName,
    0
  );
  if (injector !== undefined) {
    const unsub = await tx.signAndSend(performingAccount.address, { signer: injector.signer }, (result) => {
      if (result.status.isFinalized) {
        setFinished(true);
        unsub();
        api.disconnect();
      }
    });
  }

};

export const propose4AddingTheMember =async (
  performingAccount:InjectedAccountWithMeta,
  proposalData: ProposalData4AddingMember,
  daoAddress: string,
) => {
  const csvData = proposalData.name + "," + proposalData.memberAddress + "," + "0" + "," + "0" + "," + "false";
  const proposalParameter:AddProposalFormData ={
    proposalKind:proposalData.proposalKind,
    title:proposalData.title,
    outline:proposalData.outline,
    githubURL:proposalData.githubURL,
    detail:proposalData.detail,
    csvData:csvData,
  };
  await addProposal(performingAccount,proposalParameter,daoAddress);  
}

export const addMemberForDao = async (
  memberManagerAddress: string,
  param: MemberFormDataForDao,
  setFinished:(value:boolean) => void
) => {
  const memberContractConstract = MemberManagerContractConstruct;
  if (typeof window.ethereum !== "undefined" && param.targetDaoAddress) {
    console.log("## addmember 2");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const memberContract = new ethers.Contract(
      memberManagerAddress,
      memberContractConstract.abi,
      signer
    );

    if ((await checkNFTMinted(param.tokenAddress)) == "") {
      alert("You still not mint your own Member Token.");
      return;
    }

    console.log("## memberManagerAddress:",memberManagerAddress);
    console.log("## param.targetDaoAddress:",param.targetDaoAddress);
    console.log("## param.name:",param.name);
    console.log("## signer.getAddress:",signer.getAddress());
    console.log("## param.proposalId:",param.proposalId);
    console.log("## param.tokenId:",param.tokenId);

    const tx = await memberContract
      .addMember(
        param.targetDaoAddress,
        param.name,
        signer.getAddress(),
        param.proposalId,
        param.tokenId
      )
      .catch((err: any) => {
        console.log(err);
        errorFunction(err);
      });
    const ret = await tx.wait();
    setFinished(true);
  }
};

export const Proposal4ResetElectionComission = async (
  performingAccount:InjectedAccountWithMeta,
  proposalData: PropsalData4ElectionComission,
  daoAddress: string
) => {
  const csvData = proposalData.candidateEoa_one + "," + proposalData.candidateEoa_two;
  const proposalParameter:AddProposalFormData ={
    proposalKind:proposalData.proposalKind,
    title:proposalData.title,
    outline:proposalData.outline,
    githubURL:proposalData.githubURL,
    detail:proposalData.detail,
    csvData:csvData,
  };
  await addProposal(performingAccount,proposalParameter,daoAddress);  
};

export const propose4DeletingTheMember =async (
  performingAccount:InjectedAccountWithMeta,
  memberInfoData: MemberInfo,
  proposalData: AddProposalData,
  daoAddress: string,
) => {
  const csvData = memberInfoData.eoaAddress;
  const proposalParameter:AddProposalFormData ={
    proposalKind:proposalData.proposalKind,
    title:proposalData.title,
    outline:proposalData.outline,
    githubURL:proposalData.githubURL,
    detail:proposalData.detail,
    csvData:csvData,
  };
  console.log("## delete proposal. parameter:",proposalParameter);
  await addProposal(performingAccount,proposalParameter,daoAddress);  
};

