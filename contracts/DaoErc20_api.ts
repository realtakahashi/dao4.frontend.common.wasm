import DaoErc20Contract from "./construct/DaoErc20";
import { ethers } from "ethers";
import { errorFunction } from "./commonFunctions";
import {
  Erc20DeployData,
  ProposalData4ChangingTokenSaleStatus,
} from "../types/Token";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { AddProposalFormData } from "../types/ProposalManagerType";
import { addProposal } from "./ProposalManagerApi";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise, CodePromise } from "@polkadot/api-contract";
import psp20Abi from "./construct/Psp22.json";
import { checkEventsAndInculueError } from "./contract_common_util";
import psp22ContractWasm from "../contracts/construct/Psp22_contract.json";

const blockchainUrl = String(process.env.NEXT_PUBLIC_BLOCKCHAIN_URL) ?? "";
const gasLimit = 100000 * 1000000;
const storageDepositLimit = null;

export const deployDaoErc20 = async (
  performingAccount: InjectedAccountWithMeta,
  inputData: Erc20DeployData,
  setTokenAddress:(tokenAddress:string) => void
) => {
  const wsProvider = new WsProvider(blockchainUrl);
  const api = await ApiPromise.create({ provider: wsProvider });

  const { web3FromSource } = await import("@polkadot/extension-dapp");
  const contractWasm = psp22ContractWasm.source.wasm;
  const contract = new CodePromise(api, psp20Abi, contractWasm);
  const injector = await web3FromSource(performingAccount.meta.source);
  const tx = contract.tx.new(
    { gasLimit, storageDepositLimit },
    inputData.initialSupply,
    inputData.tokenName,
    inputData.tokenSymbol,
    inputData.decimal,
    inputData.daoAddress,
    inputData.price
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

export const buy = async (
  performingAccount: InjectedAccountWithMeta,
  tokenAddress: string,
  amount: number
) => {
  const { web3FromSource } = await import("@polkadot/extension-dapp");
  const wsProvider = new WsProvider(blockchainUrl);
  const api = await ApiPromise.create({ provider: wsProvider });

  const price = await getPrice(performingAccount.address, tokenAddress);
  const priceAmount = Number(price) * amount;

  const contract = new ContractPromise(api, psp20Abi, tokenAddress);
  const injector = await web3FromSource(performingAccount.meta.source);
  const tx = await contract.tx.buy_token(
    { value: priceAmount, gasLimit: gasLimit },
    performingAccount.address,
    amount
  );
  if (injector !== undefined) {
    const unsub = await tx.signAndSend(
      performingAccount.address,
      { signer: injector.signer },
      (result, events = []) => {
        if (result.status.isFinalized) {
          if (checkEventsAndInculueError(events)) {
            alert("Transaction is failure.");
          }
          unsub();
          api.disconnect();
        }
      }
    );
  }
};

export const proposeChangingTokenSaleStatus = async (
  performingAccount: InjectedAccountWithMeta,
  proposalData: ProposalData4ChangingTokenSaleStatus,
  tokenAddress: string,
  daoAddress: string
) => {
  let isStart = "0";
  if (proposalData.tokenSaleStatus == false) {
    isStart = "1";
  }
  const csvData = tokenAddress + "," + isStart;
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

export const getContractBalance = async (
  tokenAddress: string
): Promise<number> => {
  const contractConstract = DaoErc20Contract;
  let res = 0;
  if (typeof window.ethereum !== "undefined" && tokenAddress) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      tokenAddress,
      contractConstract.abi,
      signer
    );
    res = await contract.getContractBalance().catch((err: any) => {
      console.log(err);
      errorFunction(err);
    });
  }

  return res;
};

export const getMintedAmount = async (
  peformanceAddress: string,
  tokenAddress: string
): Promise<string> => {
  let res = "0";
  const wsProvider = new WsProvider(blockchainUrl);
  const api = await ApiPromise.create({ provider: wsProvider });
  const contract = new ContractPromise(api, psp20Abi, tokenAddress);
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
  return res;
};

export const getSalesAmount = async (
  peformanceAddress: string,
  tokenAddress: string
): Promise<string> => {
  let res = "0";
  const wsProvider = new WsProvider(blockchainUrl);
  const api = await ApiPromise.create({ provider: wsProvider });
  const contract = new ContractPromise(api, psp20Abi, tokenAddress);
  const { output } = await contract.query.getSalesAmount(peformanceAddress, {
    value: 0,
    gasLimit: -1,
  });
  if (output !== undefined && output !== null) {
    res = output.toHuman()?.toString() ?? "0";
  }
  return res;
};

export const getSalesStatus = async (
  peformanceAddress: string,
  tokenAddress: string
): Promise<boolean> => {
  let res = false;
  const wsProvider = new WsProvider(blockchainUrl);
  const api = await ApiPromise.create({ provider: wsProvider });
  const contract = new ContractPromise(api, psp20Abi, tokenAddress);
  const { output } = await contract.query.getTokenSalesStatus(
    peformanceAddress,
    {
      value: 0,
      gasLimit: -1,
    }
  );
  if (output !== undefined && output !== null) {
    if (output.toHuman()?.toString() == "true") {
      res = true;
    } else {
      res = false;
    }
  }
  return res;
};

export const getPrice = async (
  peformanceAddress: string,
  tokenAddress: string
): Promise<string> => {
  let res = "0";
  const wsProvider = new WsProvider(blockchainUrl);
  const api = await ApiPromise.create({ provider: wsProvider });
  const contract = new ContractPromise(api, psp20Abi, tokenAddress);
  const { output } = await contract.query.getSalesPriceForOneToken(
    peformanceAddress,
    {
      value: 0,
      gasLimit: -1,
    }
  );
  if (output !== undefined && output !== null) {
    res = output.toHuman()?.toString() ?? "0";
  }
  return res;
};

export const CreateProoposalOfWithdraw = async (
  performingAccount: InjectedAccountWithMeta,
  proposalData: ProposalData4ChangingTokenSaleStatus,
  tokenAddress: string,
  daoAddress: string
) => {
  const csvData = tokenAddress;
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
