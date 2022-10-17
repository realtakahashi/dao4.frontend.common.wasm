import DaoErc20Contract from "./construct/DaoErc20";
import { ethers } from "ethers";
import { errorFunction } from "./commonFunctions";
import { Erc20DeployData, ProposalData4ChangingTokenSaleStatus } from "../types/Token";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { AddProposalFormData } from "../types/ProposalManagerType";
import { addProposal } from "./ProposalManagerApi";

export const deployDaoErc20 = async (
  inputData: Erc20DeployData
): Promise<string> => {
  let res: string = "";
  const daoErc20Contract = DaoErc20Contract;
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const factory = new ethers.ContractFactory(
      daoErc20Contract.abi,
      daoErc20Contract.bytecode,
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

export const mint = async (
  priceEther: number,
  amount: number,
  tokenAddress: string
) => {
  const contractConstract = DaoErc20Contract;
  if (typeof window.ethereum !== "undefined" && tokenAddress) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      tokenAddress,
      contractConstract.abi,
      signer
    );

    console.log("tokenAddress", tokenAddress);
    console.log("priceEther", priceEther);
    console.log("priceEther String", String(priceEther));
    const tmp = ethers.utils.parseEther(String(priceEther));
    console.log("priceEther convert", String(tmp));
    await contract.mint(priceEther, amount).catch((err: any) => {
      console.log(err);
      errorFunction(err);
    });
  }
};

export const buy = async (tokenAddress: string, amount: number) => {
  const contractConstract = DaoErc20Contract;
  const price = await getPrice(tokenAddress);
  const conv_amount = ethers.utils.parseEther(String(amount));
  const priceAmount = Number(price) * amount;
  if (typeof window.ethereum !== "undefined" && tokenAddress) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      tokenAddress,
      contractConstract.abi,
      signer
    );
    console.log("### priceAmount:", priceAmount);
    const value_price = ethers.utils.parseEther(String(priceAmount));
    console.log("### value price:", value_price.toString());
    await contract
      .buy(conv_amount, { value: ethers.utils.parseEther(String(priceAmount)) })
      .catch((err: any) => {
        console.log(err);
        errorFunction(err);
      });
  }
};

export const proposeChangingTokenSaleStatus = async (
  performingAccount: InjectedAccountWithMeta,
  proposalData:ProposalData4ChangingTokenSaleStatus,
  tokenAddress:string,
  daoAddress:string
) => {
  let isStart = "0";
  if (proposalData.tokenSaleStatus == false){
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
  console.log("## delete proposal. parameter:", proposalParameter);
  await addProposal(performingAccount, proposalParameter, daoAddress);

}

// export const controlTokenSale = async (
//   onSale: boolean,
//   tokenAddress: string
// ) => {
//   const contractConstract = DaoErc20Contract;
//   if (typeof window.ethereum !== "undefined" && tokenAddress) {
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     const signer = provider.getSigner();
//     const contract = new ethers.Contract(
//       tokenAddress,
//       contractConstract.abi,
//       signer
//     );
//     await contract.controlTokenSale(onSale).catch((err: any) => {
//       console.log(err);
//       errorFunction(err);
//     });
//   }
// };

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
  tokenAddress: string
): Promise<string> => {
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
    res = await contract.mintedAmount().catch((err: any) => {
      console.log(err);
      errorFunction(err);
    });
  }

  return String(res);
};

export const getSalesAmount = async (tokenAddress: string): Promise<string> => {
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
    res = await contract.salesAmount().catch((err: any) => {
      console.log(err);
      errorFunction(err);
    });
  }

  return String(res);
};

export const getSalesStatus = async (
  tokenAddress: string
): Promise<boolean> => {
  const contractConstract = DaoErc20Contract;
  let res = false;
  if (typeof window.ethereum !== "undefined" && tokenAddress) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      tokenAddress,
      contractConstract.abi,
      signer
    );
    res = await contract.onSale().catch((err: any) => {
      console.log(err);
      errorFunction(err);
    });
  }

  return res;
};

export const getPrice = async (tokenAddress: string): Promise<string> => {
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
    res = await contract.priceWei().catch((err: any) => {
      console.log(err);
      errorFunction(err);
    });
  }

  return String(res);
};

export const withdraw = async (tokenAddress: string) => {
  console.log("### withdraw 0");
  const contractConstract = DaoErc20Contract;
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
