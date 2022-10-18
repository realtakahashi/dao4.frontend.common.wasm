import { Erc721DeployData } from "../types/Token";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise, CodePromise, Abi } from "@polkadot/api-contract";
import psp34Abi from "./construct/Psp34.json";
import { checkEventsAndInculueError } from "./contract_common_util";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";

const blockchainUrl = String(process.env.NEXT_PUBLIC_BLOCKCHAIN_URL) ?? "";
const gasLimit = 100000 * 1000000;
const storageDepositLimit = null;

export const deployDaoErc721 = async (
  inputData: Erc721DeployData
): Promise<string> => {
  let res: string = "";
  const daoErc721Contract = DaoErc721Contract;
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const factory = new ethers.ContractFactory(
      daoErc721Contract.abi,
      daoErc721Contract.bytecode,
      signer
    );
    const result: any = await factory
      .deploy(
        inputData.tokenName,
        inputData.tokenSymbol,
        inputData.daoAddress,
        ethers.utils.parseEther(String(inputData.priceWei)),
        inputData.baseUri
      )
      .catch((err: any) => {
        errorFunction(err);
      });
    res = result.address;
  }

  return res;
};

export const buy = async (
  performingAccount: InjectedAccountWithMeta,
  tokenAddress: string,
  setTokenId: (id: string) => void
) => {
  const { web3FromSource } = await import("@polkadot/extension-dapp");
  const wsProvider = new WsProvider(blockchainUrl);
  const api = await ApiPromise.create({ provider: wsProvider });

  const price = await getPrice(performingAccount.address, tokenAddress);

  const contract = new ContractPromise(api, psp34Abi, tokenAddress);
  const injector = await web3FromSource(performingAccount.meta.source);
  const tx = await contract.tx.mintForBuy(
    { value: price, gasLimit: gasLimit },
    performingAccount.address
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
          events.forEach(({ event }) => {
            if (api.events.contracts.ContractEmitted.is(event)) {
              const [account_id, contract_evt] = event.data;
              const decoded = new Abi(psp34Abi).decodeEvent(contract_evt);
              setTokenId(decoded.args[1].toHuman()?.toString() ?? "0");
            }
          });
          unsub();
          api.disconnect();
        }
      }
    );
  }
};

export const controlTokenSale = async (
  onSale: boolean,
  tokenAddress: string
) => {
  const contractConstract = DaoErc721Contract;
  if (typeof window.ethereum !== "undefined" && tokenAddress) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      tokenAddress,
      contractConstract.abi,
      signer
    );
    await contract.controlTokenSale(onSale).catch((err: any) => {
      console.log(err);
      errorFunction(err);
    });
  }
};

export const getContractBalance = async (
  tokenAddress: string
): Promise<number> => {
  const contractConstract = DaoErc721Contract;
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

export const withdraw = async (tokenAddress: string) => {
  const contractConstract = DaoErc721Contract;
  if (typeof window.ethereum !== "undefined" && tokenAddress) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      tokenAddress,
      contractConstract.abi,
      signer
    );
    await contract.withdraw().catch((err: any) => {
      console.log(err);
      errorFunction(err);
    });
  }
};

export const tokenURI = async (
  tokenAddress: string,
  tokenId: string
): Promise<string> => {
  const contractConstract = DaoErc721Contract;
  let res = "";
  if (typeof window.ethereum !== "undefined" && tokenAddress) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      tokenAddress,
      contractConstract.abi,
      signer
    );
    res = await contract.tokenURI(tokenId).catch((err: any) => {
      console.log(err);
      errorFunction(err);
    });
  }

  return res;
};

export const getPrice = async (
  peformanceAddress: string,
  tokenAddress: string
): Promise<number> => {
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
  return Number(res);
};

export const getSalesAmount = async (
  peformanceAddress: string,
  tokenAddress: string
): Promise<number> => {
  let res = "0";
  const wsProvider = new WsProvider(blockchainUrl);
  const api = await ApiPromise.create({ provider: wsProvider });
  const contract = new ContractPromise(api, psp34Abi, tokenAddress);
  const { output } = await contract.query.getSalesAmount(peformanceAddress, {
    value: 0,
    gasLimit: -1,
  });
  if (output !== undefined && output !== null) {
    res = output.toHuman()?.toString() ?? "0";
  }
  return Number(res);
};

export const getSalesStatus = async (
  peformanceAddress: string,
  tokenAddress: string
): Promise<boolean> => {
  let res = false;
  const wsProvider = new WsProvider(blockchainUrl);
  const api = await ApiPromise.create({ provider: wsProvider });
  const contract = new ContractPromise(api, psp34Abi, tokenAddress);
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
