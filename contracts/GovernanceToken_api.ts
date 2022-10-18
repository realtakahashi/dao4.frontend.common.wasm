import { ethers } from "ethers";
import { errorFunction } from "./commonFunctions";
import {
  Erc20DeployData,
  ProposalData4TransferGovernanceToken,
} from "../types/Token";
import GovernaceTokenConstract from "./construct/GonvernanceToken";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise, CodePromise, Abi } from "@polkadot/api-contract";
import governanceAbi from "./construct/GovernanceToken.json";
import { checkEventsAndInculueError } from "./contract_common_util";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { AddProposalFormData } from "../types/ProposalManagerType";
import { addProposal } from "./ProposalManagerApi";

const blockchainUrl = String(process.env.NEXT_PUBLIC_BLOCKCHAIN_URL) ?? "";
const gasLimit = 100000 * 1000000;
const storageDepositLimit = null;

export const deployGonvernanceToken = async (
  inputData: Erc20DeployData
): Promise<string> => {
  let res: string = "";
  const GovernanceContract = GovernaceTokenConstract;
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const factory = new ethers.ContractFactory(
      GovernanceContract.abi,
      GovernanceContract.bytecode,
      signer
    );
    const result: any = await factory
      .deploy(inputData.tokenName, inputData.tokenSymbol, inputData.daoAddress)
      .catch((err: any) => {
        errorFunction(err);
      });
    res = result.address;
  }

  return res;
};

export const mint = async (amount: number, tokenAddress: string) => {
  const contractConstract = GovernaceTokenConstract;
  if (typeof window.ethereum !== "undefined" && tokenAddress) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      tokenAddress,
      contractConstract.abi,
      signer
    );

    console.log("tokenAddress", tokenAddress);
    await contract.mint(amount).catch((err: any) => {
      console.log(err);
      errorFunction(err);
    });
  }
};

export const createProposalDistributeGovToken = async (
  performingAccount: InjectedAccountWithMeta,
  daoAddress: string,
  tokenAddress: string,
  proposalData: ProposalData4TransferGovernanceToken
) => {
  const addressArray = proposalData.amountListCsv.split(",");
  const amountArray = proposalData.amountListCsv.split(",");
  if (addressArray.length != amountArray.length){
    alert("Invalid Input.");
    return;
  }
  let csvData = tokenAddress + ",";
  for (let i = 0; i<addressArray.length; i++){
    csvData = csvData + addressArray[i] + "#" + amountArray[i];
    if (i != addressArray.length - 1) {
      csvData = csvData + "?";
    }
  }
  const proposalParameter: AddProposalFormData = {
    proposalKind: proposalData.proposalKind,
    title: proposalData.title,
    outline: proposalData.outline,
    githubURL: proposalData.githubURL,
    detail: proposalData.detail,
    csvData: csvData,
  };
  await addProposal(performingAccount, proposalParameter, daoAddress);

};

export const getMintedAmount = async (
  peformanceAddress: string,
  tokenAddress: string
): Promise<string> => {
  let res = "0";
  const wsProvider = new WsProvider(blockchainUrl);
  const api = await ApiPromise.create({ provider: wsProvider });
  const contract = new ContractPromise(api, governanceAbi, tokenAddress);
  const { output } = await contract.query["psp22::totalSupply"](
    peformanceAddress,
    {
      value: 0,
      gasLimit: -1,
    }
  );
  if (output !== undefined && output !== null) {
    res = output.toHuman()?.toString() ?? "0";
  }

  return String(res);
};
