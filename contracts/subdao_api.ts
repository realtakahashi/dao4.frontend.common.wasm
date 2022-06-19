import MasterDAOContractConstruct from "./construct/MasterDAO";
import { SubDAOData, SubDAODataWithMemberFlg, SubDAODeployFormData } from "../types/SubDaoType";
import Web3 from "web3";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { errorFunction } from "./commonFunctions";
import MemberManagerConstruct from "../contracts/construct/MemberManager";
import SubDAOContractConstruct from "../contracts/construct/SubDAOContractConstruct";
import { TokenInfo, TokenInfoWithName, TokenKind } from "../types/Token";
import DaoErc20Contract from "./construct/DaoErc20";
import DaoErc721Contract from "./construct/DaoErc721";

export const listSubDAO = async (
  masterDAOAddress: string
): Promise<Array<SubDAOData>> => {
  const contractConstract = MasterDAOContractConstruct;
  let response: SubDAOData[] = [];
  const provider = await detectEthereumProvider({ mustBeMetaMask: true });
  if (provider && window.ethereum?.isMetaMask) {
    if (typeof window.ethereum !== "undefined" && masterDAOAddress) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        masterDAOAddress,
        contractConstract.abi,
        signer
      );
      await contract
        .getDaoList()
        .then((r: any) => {
          console.log(r);
          response = r;
        })
        .catch((err: any) => {
          console.log(err);
          errorFunction(err);
        });
    }
  } else {
    alert("Please instal metamask.");
  }
  return response;
};

export const getIsMember =async (memberManagerDAOAddress: string,daoAddress:string):Promise<boolean> => {
  const contractConstract = MemberManagerConstruct;
  let response: boolean = false;
  const provider = await detectEthereumProvider({ mustBeMetaMask: true });
  if (provider && window.ethereum?.isMetaMask) {
    if (typeof window.ethereum !== "undefined" && memberManagerDAOAddress) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        memberManagerDAOAddress,
        contractConstract.abi,
        signer
      );
    const response = await contract.isMember(daoAddress, signer.getAddress());
      }
    }
  return response;
}

export const getDaoListOfAffiliation = async (
  memberManagerDAOAddress: string,
  subDaoList: Array<SubDAOData>
): Promise<Array<SubDAODataWithMemberFlg>> => {
  const contractConstract = MemberManagerConstruct;
  let response: SubDAODataWithMemberFlg[] = [];
  const provider = await detectEthereumProvider({ mustBeMetaMask: true });
  if (provider && window.ethereum?.isMetaMask) {
    if (typeof window.ethereum !== "undefined" && memberManagerDAOAddress) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        memberManagerDAOAddress,
        contractConstract.abi,
        signer
      );
      for (const item of subDaoList) {
        let itemWithFlg:SubDAODataWithMemberFlg = {
          ownerAddress:item.ownerAddress,
          daoAddress:item.daoAddress,
          daoName:item.daoName,
          description:item.description,
          githubURL:item.githubURL,
          rewardApproved:item.rewardApproved,
          isMember:false
        }
        if (await contract.isMember(item.daoAddress, signer.getAddress())) {
          itemWithFlg.isMember = true;
        }
        response.push(itemWithFlg);
      }
    }
  } else {
    alert("Please instal metamask.");
  }
  return response;
};

export const deploySubDAO = async (
  inputData: SubDAODeployFormData,
  memberManagerContractAddress: string,
  proposalManagerContractAddress: string,
  setDaoAddress: (address: string) => void
): Promise<string> => {
  let subDAOContractAddess = "";
  const contractConstract = SubDAOContractConstruct;
  if (memberManagerContractAddress === "") {
    throw new Error("memberManagerContractAddress is required");
  }
  if (proposalManagerContractAddress === "") {
    throw new Error("proposalManagerContractAddress is required");
  }
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const factory = new ethers.ContractFactory(
      contractConstract.abi,
      contractConstract.bytecode,
      signer
    );
    const result: any = await factory
      .deploy(
        inputData.name,
        inputData.githubUrl,
        memberManagerContractAddress,
        proposalManagerContractAddress,
        inputData.memberNFTAddress
      )
      // .then((res: any) => {
      //   subDAOContractAddess = res.address
      // })
      .catch((err: any) => {
        errorFunction(err);
      });
    subDAOContractAddess = result.address;
  }
  console.log("### subDAOContractAddess:", subDAOContractAddess);
  setDaoAddress(subDAOContractAddess);
  return subDAOContractAddess;
};

export const doDonateSubDao = async (subDaoAddress:string,amount:number) => {
  const contractConstract = SubDAOContractConstruct;
  if (typeof window.ethereum !== "undefined" && subDaoAddress) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      subDaoAddress,
      contractConstract.abi,
      signer
    );
    await contract
      .donate({value:ethers.utils.parseEther(String(amount))})
      .catch((err: any) => {
        console.log(err);
        errorFunction(err);
      });
  }
};

export const getDaoBalance = async (daoAddress:string): Promise<number> => {
  const contractConstract = SubDAOContractConstruct;
  let response: number = 0;
  if (typeof window.ethereum !== "undefined" && daoAddress) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      daoAddress,
      contractConstract.abi,
      signer
    );
    response = await contract.getContractBalance().catch((err: any) => {
      console.log(err);
      errorFunction(err);
    });
    //console.log("### getProposalList Return: ", response);
  }
  return response;
};

export const getDaoName = async (daoAddress:string): Promise<string> => {
  const contractConstract = SubDAOContractConstruct;
  let response: string = "";
  if (typeof window.ethereum !== "undefined" && daoAddress) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      daoAddress,
      contractConstract.abi,
      signer
    );
    response = await contract.daoName().catch((err: any) => {
      console.log(err);
      errorFunction(err);
    });
    console.log("### daoName Return: ", response);
  }
  return response;
};

export const getTokenList = async (
  daoAddress: string
): Promise<Array<TokenInfo>> => {
  const contractConstract = SubDAOContractConstruct;
  let response: TokenInfo[] = [];
  const provider = await detectEthereumProvider({ mustBeMetaMask: true });
  if (provider && window.ethereum?.isMetaMask) {
    if (typeof window.ethereum !== "undefined" && daoAddress) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        daoAddress,
        contractConstract.abi,
        signer
      );
      await contract
        .getTokenList()
        .then((r: any) => {
          console.log(r);
          response = r;
        })
        .catch((err: any) => {
          console.log(err);
          errorFunction(err);
        });
    }
  } else {
    alert("Please instal metamask.");
  }
  return response;
};

export const getTokenListWithName = async (tokenList:Array<TokenInfo>):Promise<Array<TokenInfoWithName>> => {
  let response: TokenInfoWithName[] = [];
  const erc20contractDefine = DaoErc20Contract;
  const erc721contractDefine = DaoErc721Contract;
  const provider = await detectEthereumProvider({ mustBeMetaMask: true });
  if (provider && window.ethereum?.isMetaMask) {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      for (var item of tokenList){
        let commonContractDefine:any;
        if (item.tokenKind == TokenKind.ERC20){
          commonContractDefine = erc20contractDefine;
        }
        else{
          commonContractDefine = erc721contractDefine;
        }
        const contract = new ethers.Contract(item.tokenAddress,commonContractDefine.abi,signer);
        let tokenName = await contract.name()
        .catch((err: any) => {
          console.log(err);
          errorFunction(err);
        });
        let tokenSymbol = await contract.symbol()
        .catch((err: any) => {
          console.log(err);
          errorFunction(err);
        });
        const pushItem:TokenInfoWithName = {
            tokenAddress: item.tokenAddress,
            tokenKind: item.tokenKind,
            tokenName: String(tokenName),
            tokenSymbol: String(tokenSymbol),
          }

          response.push(pushItem);
      }

    }
  } else {
    alert("Please instal metamask.");
  }


  return response;
}

export const divide=async(proposalId:string,daoAddress:string,targetAddress:string,amount:number)=>{
  const contractConstract = SubDAOContractConstruct;
  if (typeof window.ethereum !== "undefined" && daoAddress) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      daoAddress,
      contractConstract.abi,
      signer
    );
    await contract
      .divide(targetAddress,ethers.utils.parseEther(String(amount)),proposalId)
      .catch((err: any) => {
        console.log(err);
        errorFunction(err);
      });
  }
}

export const addTokenToList=async(tokenKind:TokenKind,tokenAddress:string,daoAddress:string)=>{
  console.log("daoAddress:",daoAddress);
  const contractConstract = SubDAOContractConstruct;
  if (typeof window.ethereum !== "undefined" && daoAddress) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      daoAddress,
      contractConstract.abi,
      signer
    );
    await contract
      .addTokenToList(tokenKind,tokenAddress)
      .catch((err: any) => {
        console.log(err);
        errorFunction(err);
      });
  }
}

export const getMemberNFTAddress=async(daoAddress:string):Promise<string>=>{
  console.log("daoAddress:",daoAddress);
  const contractConstract = SubDAOContractConstruct;
  let ret = "";
  if (typeof window.ethereum !== "undefined" && daoAddress) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      daoAddress,
      contractConstract.abi,
      signer
    );
    ret = await contract
      .getMemberNFTAddress()
      .catch((err: any) => {
        console.log(err);
        errorFunction(err);
      });
  }
  return ret;
}