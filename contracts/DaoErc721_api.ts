import { Erc721DeployData } from "../types/Token";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise, CodePromise, Abi } from "@polkadot/api-contract";
import psp34Abi from "./construct/Psp34.json";
import psp34ContractWasm from "./construct/Psp34_contract.json";
import { checkEventsAndInculueError, formatBalances } from "./contract_common_util";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { BN } from "@polkadot/util";

// const gasLimit = 100000 * 1000000;
const storageDepositLimit = null;
const initial_id = 0;

export const deployDaoErc721 = async (
  api:any,
  performingAccount: InjectedAccountWithMeta,
  inputData: Erc721DeployData,
  setTokenAddress:(tokenAddress:string) => void
) => {
  const { web3FromSource } = await import("@polkadot/extension-dapp");
  const contractWasm = psp34ContractWasm.source.wasm;
  const contract = new CodePromise(api, psp34Abi, contractWasm);
  const injector = await web3FromSource(performingAccount.meta.source);
  const decimals = api.registry.chainDecimals;
  const decimalPrice:Number = inputData.price * (10 ** decimals[0]);
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const tx = contract.tx.new(
    { gasLimit, storageDepositLimit },
    initial_id,
    inputData.tokenName,
    inputData.tokenSymbol,
    inputData.baseUri,
    decimalPrice.toString(),
    inputData.daoAddress,
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
  setTokenId: (id: string) => void
) => {
  const { web3FromSource } = await import("@polkadot/extension-dapp");

  const price = await getPrice(api, performingAccount.address, tokenAddress);
  console.log("### psp34 price:",price);
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const contract = new ContractPromise(api, psp34Abi, tokenAddress);
  const injector = await web3FromSource(performingAccount.meta.source);
  const tx = await contract.tx.mintForBuy(
    { value: price.toString().replaceAll(",",""), gasLimit: gasLimit },
    performingAccount.address
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
          // check compile error
          events.forEach(({ event }) => {
            if (api.events.contracts.ContractEmitted.is(event)) {
              const [account_id, contract_evt] = event.data;
              const decoded = new Abi(psp34Abi).decodeEvent(contract_evt);
              console.log("### psp34 event decoded:",decoded);
              const tokenId = decoded.args[1].toString() ?? "0";
              console.log("### tokenId:",tokenId);
              setTokenId(tokenId);
            }
          });
          unsub();
        }
      }
    );
  }
};

export const getPrice = async (
  api:any,
  peformanceAddress: string,
  tokenAddress: string
): Promise<string> => {
  let res = "0";
  const contract = new ContractPromise(api, psp34Abi, tokenAddress);
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const { output } = await contract.query.getSalesPrice(
    peformanceAddress,
    {
      value: 0,
      gasLimit: gasLimit,
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
): Promise<number> => {
  let res = "0";
  const contract = new ContractPromise(api, psp34Abi, tokenAddress);
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const { output } = await contract.query.getSalesAmount(peformanceAddress, {
    value: 0,
    gasLimit: gasLimit,
  });
  if (output !== undefined && output !== null) {
    res = output.toHuman()?.toString() ?? "0";
  }
  return Number(res);
};

export const getSalesStatus = async (
  api:any,
  peformanceAddress: string,
  tokenAddress: string
): Promise<boolean> => {
  let res = false;
  const contract = new ContractPromise(api, psp34Abi, tokenAddress);
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const { output } = await contract.query.getTokenSalesStatus(
    peformanceAddress,
    {
      value: 0,
      gasLimit: gasLimit,
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
