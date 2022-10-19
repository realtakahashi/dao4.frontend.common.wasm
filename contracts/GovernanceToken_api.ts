import { ethers } from "ethers";
import { errorFunction } from "./commonFunctions";
import {
  GovernanceDeployData,
  ProposalData4TransferGovernanceToken,
} from "../types/Token";
import GovernaceTokenConstract from "./construct/GonvernanceToken";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise, CodePromise, Abi } from "@polkadot/api-contract";
import governanceAbi from "./construct/GovernanceToken.json";
import GovernanceContractWasm from "./construct/GovernanceToken_contract.json";
import { checkEventsAndInculueError } from "./contract_common_util";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { AddProposalFormData } from "../types/ProposalManagerType";
import { addProposal } from "./ProposalManagerApi";

const blockchainUrl = String(process.env.NEXT_PUBLIC_BLOCKCHAIN_URL) ?? "";
const gasLimit = 100000 * 1000000;
const storageDepositLimit = null;

export const deployGonvernanceToken = async (
  performingAccount: InjectedAccountWithMeta,
  inputData: GovernanceDeployData,
  setTokenAddress:(tokenAddress:string) => void
) => {
  const wsProvider = new WsProvider(blockchainUrl);
  const api = await ApiPromise.create({ provider: wsProvider });

  const { web3FromSource } = await import("@polkadot/extension-dapp");
  const contractWasm = GovernanceContractWasm.source.wasm;
  const contract = new CodePromise(api, governanceAbi, contractWasm);
  const injector = await web3FromSource(performingAccount.meta.source);
  const tx = contract.tx.new(
    { gasLimit, storageDepositLimit },
    inputData.initialSupply,
    inputData.tokenName,
    inputData.tokenSymbol,
    inputData.decimal,
    inputData.daoAddress,
  );
  const unsub = await tx.signAndSend(
    performingAccount.address,
    { signer: injector.signer },
    ({ events = [], contract, status }) => {
      if (status.isFinalized) {
        if (checkEventsAndInculueError(events)) {
          alert("Transaction is failure.");
        } else {
          let tokenAddess = contract.address.toString();
          setTokenAddress(tokenAddess);
        }
        unsub();
        api.disconnect();
      }
    }
  );
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
