import { ethers } from "ethers";
import { errorFunction } from "./commonFunctions";
import { Erc20DeployData } from "../types/Token";
import GovernaceTokenConstract from "./construct/GonvernanceToken";

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

export const mint = async (
  amount: number,
  tokenAddress: string
) => {
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

export const transfer = async (
    amount: number,
    to:string,
    tokenAddress: string
  ) => {
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
      await contract.transfer(to,ethers.utils.parseEther(String(amount))).catch((err: any) => {
        console.log(err);
        errorFunction(err);
      });
    }
  };
  
  export const getMintedAmount = async (
    tokenAddress: string
  ): Promise<string> => {
    const contractConstract = GovernaceTokenConstract;
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
  