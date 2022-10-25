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
import { checkEventsAndInculueError, formatBalances } from "./contract_common_util";
import psp22ContractWasm from "../contracts/construct/Psp22_contract.json";
import { BN } from "@polkadot/util"

const gasLimit = 100000 * 1000000;
const storageDepositLimit = null;

export const deployDaoErc20 = async (
  api:any,
  performingAccount: InjectedAccountWithMeta,
  inputData: Erc20DeployData,
  setTokenAddress:(tokenAddress:string) => void
) => {
  const { web3FromSource } = await import("@polkadot/extension-dapp");
  const contractWasm = psp22ContractWasm.source.wasm;
  const contract = new CodePromise(api, psp20Abi, contractWasm);
  const injector = await web3FromSource(performingAccount.meta.source);
  const decimals = api.registry.chainDecimals;
  const decimalPrice:Number = inputData.price * (10 ** decimals[0]);
  const decimaal10 = 10 ** inputData.decimal;
  const decimalInitialSupply = new BN(inputData.initialSupply.toString()).mul(new BN(decimaal10.toString()));
  console.log("### decimalInitialSupply:",decimalInitialSupply.toString() );

  const tx = contract.tx.new(
    { gasLimit, storageDepositLimit },
    decimalInitialSupply.toString(),
    inputData.tokenName,
    inputData.tokenSymbol,
    inputData.decimal,
    inputData.daoAddress,
    decimalPrice.toString()
  );
  // check compile error
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
      }
    }
  );
};

export const buy = async (
  api:any,
  performingAccount: InjectedAccountWithMeta,
  tokenAddress: string,
  amount: BN
) => {
  const { web3FromSource } = await import("@polkadot/extension-dapp");
  const price = await (await getPrice(api,performingAccount.address, tokenAddress)).replaceAll(",","");
  console.log("### buy psp22: price:",price);
  console.log("### buy psp22: amount:",amount.toString());

  const priceAmount = new BN(price).mul(amount);

  const contract = new ContractPromise(api, psp20Abi, tokenAddress);
  const injector = await web3FromSource(performingAccount.meta.source);
  const tx = await contract.tx.buyToken(
    { value: priceAmount.toString(), gasLimit: gasLimit },
    performingAccount.address,
    amount.toString()
  );
  if (injector !== undefined) {
    const unsub = await tx.signAndSend(
      performingAccount.address,
      { signer: injector.signer },
      ( {events = [],status} ) => {
        if (status.isFinalized) {
          if (checkEventsAndInculueError(events) == true) {
            console.log("### checkEventsAndInculueError is true");
            alert("Transaction is failure.");
          }
          unsub();
        }
      }
    );
  }
};

export const proposeChangingTokenSaleStatus = async (
  api:any,
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
  await addProposal(api,performingAccount, proposalParameter, daoAddress);
};

// export const getContractBalance = async (
//   tokenAddress: string
// ): Promise<number> => {
//   const contractConstract = DaoErc20Contract;
//   let res = 0;
//   if (typeof window.ethereum !== "undefined" && tokenAddress) {
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     const signer = provider.getSigner();
//     const contract = new ethers.Contract(
//       tokenAddress,
//       contractConstract.abi,
//       signer
//     );
//     res = await contract.getContractBalance().catch((err: any) => {
//       console.log(err);
//       errorFunction(err);
//     });
//   }

//   return res;
// };

export const getMintedAmount = async (
  api:any,
  peformanceAddress: string,
  tokenAddress: string
): Promise<string> => {
  let res = "0";
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
  api:any,
  peformanceAddress: string,
  tokenAddress: string
): Promise<string> => {
  let res = "0";
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
  api:any,
  peformanceAddress: string,
  tokenAddress: string
): Promise<boolean> => {
  let res = false;
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
  api:any,
  peformanceAddress: string,
  tokenAddress: string,
): Promise<string> => {
  let res = "0";
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
  api:any,
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
  await addProposal(api,performingAccount, proposalParameter, daoAddress);
};
