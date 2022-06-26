import DaoErc721Contract from "./construct/DaoErc721";
import { ethers } from "ethers";
import { errorFunction } from "./commonFunctions";
import { Erc721DeployData } from "../types/Token";

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

export const buy = async (tokenAddress:string,setTokenId:(id:string) => void) => {
    const contractConstract = DaoErc721Contract;
    const price = await getPrice(tokenAddress);
    if (typeof window.ethereum !== "undefined" && tokenAddress) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        tokenAddress,
        contractConstract.abi,
        signer
      );
      const tx = await contract
        .buy({value:price})
        // .then(() => {
        //   const filters = contract.filters["Bought"];
        //   if (filters !== undefined) {
        //     provider.once("block", () => {
        //       contract.on(filters(), (senderAddress, tokenID) => {
        //         console.log(senderAddress, tokenID);
        //         const id = parseInt(tokenID._hex,16);
        //         setTokenId(id.toString());
        //       });
        //     });
        //   }
  
        // })
        .catch((err: any) => {
          console.log(err);
          errorFunction(err);
        });
        if (tx !== undefined) {
          const ret = await tx.wait();
          console.log("ret.events:", ret.events);
          console.log("tokenId hex", ret.events[0].args.tokenId);
          console.log("tokenid:", String(Number(ret.events[0].args.tokenId)));
          const id = Number(ret.events[0].args.tokenId);
          setTokenId(id.toString());
          alert("Your Token Id is :" + id);
        }
    
    }
  };
  
  export const controlTokenSale = async (onSale:boolean,tokenAddress:string) => {
    const contractConstract = DaoErc721Contract;
    if (typeof window.ethereum !== "undefined" && tokenAddress) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        tokenAddress,
        contractConstract.abi,
        signer
      );
      await contract
        .controlTokenSale(onSale)
        .catch((err: any) => {
          console.log(err);
          errorFunction(err);
        });
    }
  };
  
  export const getContractBalance = async (tokenAddress:string):Promise<number> => {
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
      res = await contract
        .getContractBalance()
        .catch((err: any) => {
          console.log(err);
          errorFunction(err);
        });
    }
  
    return res;
  };
  
  export const withdraw = async (tokenAddress:string) => {
    const contractConstract = DaoErc721Contract;
    if (typeof window.ethereum !== "undefined" && tokenAddress) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        tokenAddress,
        contractConstract.abi,
        signer
      );
      await contract
        .withdraw()
        .catch((err: any) => {
          console.log(err);
          errorFunction(err);
        });
    }
  };

  export const tokenURI = async (tokenAddress:string,tokenId:string):Promise<string> => {
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
      res = await contract
        .tokenURI(tokenId)
        .catch((err: any) => {
          console.log(err);
          errorFunction(err);
        });
    }
  
    return res;
  };

  export const getPrice = async (tokenAddress:string):Promise<number> => {
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
      res = await contract
        .priceWei()
        .catch((err: any) => {
          console.log(err);
          errorFunction(err);
        });
    }
    return res;
  }

  export const getSalesAmount = async (tokenAddress:string):Promise<number> => {
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
      res = await contract
        .salesAmount()
        .catch((err: any) => {
          console.log(err);
          errorFunction(err);
        });
    }
  
    return res;
  };

  export const getSalesStatus = async (tokenAddress:string):Promise<boolean> => {
    const contractConstract = DaoErc721Contract;
    let res = false;
    if (typeof window.ethereum !== "undefined" && tokenAddress) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        tokenAddress,
        contractConstract.abi,
        signer
      );
      res = await contract
        .onSale()
        .catch((err: any) => {
          console.log(err);
          errorFunction(err);
        });
    }
  
    return res;
  };
  