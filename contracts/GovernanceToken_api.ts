import {
  GovernanceDeployData,
  ProposalData4TransferGovernanceToken,
} from "../types/Token";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise, CodePromise, Abi } from "@polkadot/api-contract";
import governanceAbi from "./construct/GovernanceToken.json";
import GovernanceContractWasm from "./construct/GovernanceToken_contract.json";
import { checkEventsAndInculueError } from "./contract_common_util";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { AddProposalFormData } from "../types/ProposalManagerType";
import { addProposal } from "./ProposalManagerApi";
import { BN } from "@polkadot/util";

const gasLimit = 100000 * 1000000;
const storageDepositLimit = null;

export const deployGonvernanceToken = async (
  api:any,
  performingAccount: InjectedAccountWithMeta,
  inputData: GovernanceDeployData,
  setTokenAddress:(tokenAddress:string) => void
) => {
  const { web3FromSource } = await import("@polkadot/extension-dapp");
  const contractWasm = GovernanceContractWasm.source.wasm;
  const contract = new CodePromise(api, governanceAbi, contractWasm);
  const injector = await web3FromSource(performingAccount.meta.source);
  const decimaal10 = 10 ** inputData.decimal;
  const decimalInitialSupply = new BN(inputData.initialSupply.toString()).mul(new BN(decimaal10.toString()));

  const tx = contract.tx.new(
    { gasLimit, storageDepositLimit },
    decimalInitialSupply,
    inputData.tokenName,
    inputData.tokenSymbol,
    inputData.decimal,
    inputData.daoAddress,
  );
  const unsub = await tx.signAndSend(
    performingAccount.address,
    { signer: injector.signer },
  // check compile error
    ({ events = [], contract, status }) => {
      if (status.isFinalized) {
        if (checkEventsAndInculueError(events)) {
          alert("Transaction is failure.");
        } else {
          let tokenAddess = contract.address.toString();
          setTokenAddress(tokenAddess);
        }
        unsub();
      }
    }
  );
};


export const createProposalDistributeGovToken = async (
  api:any,
  performingAccount: InjectedAccountWithMeta,
  daoAddress: string,
  tokenAddress: string,
  proposalData: ProposalData4TransferGovernanceToken
) => {
  const addressArray = proposalData.toListCsv.split(",");
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
  console.log("### distribute csv:",csvData);
  const proposalParameter: AddProposalFormData = {
    proposalKind: proposalData.proposalKind,
    title: proposalData.title,
    outline: proposalData.outline,
    githubURL: proposalData.githubURL,
    detail: proposalData.detail,
    csvData: csvData,
  };
  await addProposal(api, performingAccount, proposalParameter, daoAddress);

};

export const getMintedAmount = async (
  api:any,
  peformanceAddress: string,
  tokenAddress: string
): Promise<string> => {
  let res = "0";
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
