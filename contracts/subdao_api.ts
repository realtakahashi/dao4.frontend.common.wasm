import {
  SubDAOData,
  SubDAODataWithMemberFlg,
  SubDAODeployFormData,
} from "../types/SubDaoType";
import Web3 from "web3";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { errorFunction } from "./commonFunctions";
import MemberManagerConstruct from "../contracts/construct/MemberManager";
import SubDAOContractConstruct from "../contracts/construct/SubDAOContractConstruct";
import { TokenInfo, TokenInfoWithName, TokenKind } from "../types/Token";
import DaoErc20Contract from "./construct/DaoErc20";
import DaoErc721Contract from "./construct/DaoErc721";
import GovernaceTokenConstract from "./construct/GonvernanceToken";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise, CodePromise } from "@polkadot/api-contract";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import daoManagerAbi from "../contracts/construct/DaoManager.json";
import daoAbi from "../contracts/construct/Dao.json";
import memberManagerAbi from "../contracts/construct/MemberManager.json";
import daoContractWasm from "../contracts/construct/Dao_contract.json";

const blockchainUrl = String(process.env.NEXT_PUBLIC_BLOCKCHAIN_URL) ?? "";
const daoManagerAddress =
  String(process.env.NEXT_PUBLIC_DAO_MANAGER_CONTRACT_ADDRESS) ?? "";
const memberManagerAddress =
  String(process.env.NEXT_PUBLIC_MEMBER_MANAGER_CONTRACT_ADDRESS) ?? "";
// const gasLimit = -1;
const gasLimit = 100000 * 1000000;
const storageDepositLimit = null;

export const listDAOAddress = async (
  peformanceAddress: string
): Promise<Array<string>> => {
  const wsProvider = new WsProvider(blockchainUrl);
  const api = await ApiPromise.create({ provider: wsProvider });

  let response: string[] = [];

  const daoManagerContract = new ContractPromise(
    api,
    daoManagerAbi,
    daoManagerAddress
  );
  const { gasConsumed, result, output } =
    await daoManagerContract.query.getDaoList(peformanceAddress, {
      value: 0,
      gasLimit: -1,
    });
  if (output !== undefined && output !== null) {
    let response_json = output.toJSON();
    let json_data = JSON.parse(JSON.stringify(response_json));
    for (let i = 0; i < json_data.length; i++) {
      let item = json_data[i];
      response.push(item);
    }
  }
  api.disconnect();
  return response;
};

export const listSubDAO = async (
  peformanceAddress: string,
  daoAddressList: string[]
): Promise<Array<SubDAOData>> => {
  const wsProvider = new WsProvider(blockchainUrl);
  const api = await ApiPromise.create({ provider: wsProvider });

  let response: SubDAOData[] = [];

  for (let i = 0; i < daoAddressList.length; i++) {
    const daoContract = new ContractPromise(api, daoAbi, daoAddressList[i]);
    const { gasConsumed, result, output } = await daoContract.query.getDaoInfo(
      peformanceAddress,
      {
        value: 0,
        gasLimit: -1,
      }
    );
    if (output !== undefined && output !== null) {
      let response_json = output.toJSON();
      let json_data = JSON.parse(JSON.stringify(response_json));
      let item: SubDAOData = {
        daoName: json_data.daoName,
        githubURL: json_data.githubUrl,
        description: json_data.description,
        daoAddress: daoAddressList[i],
      };
      response.push(item);
    }
  }
  api.disconnect();
  return response;
};

export const getIsMember = async (
  memberManagerDAOAddress: string,
  daoAddress: string
): Promise<boolean> => {
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
};

export const getDaoListOfAffiliation = async (
  peformanceAddress: string,
  subDaoList: Array<SubDAOData>
): Promise<Array<SubDAODataWithMemberFlg>> => {
  const wsProvider = new WsProvider(blockchainUrl);
  const api = await ApiPromise.create({ provider: wsProvider });

  let response: SubDAODataWithMemberFlg[] = [];

  for (const item of subDaoList) {
    let itemWithFlg: SubDAODataWithMemberFlg = {
      daoAddress: item.daoAddress,
      daoName: item.daoName,
      description: item.description,
      githubURL: item.githubURL,
      isMember: false,
    };

    const memberManagerContract = new ContractPromise(
      api,
      memberManagerAbi,
      memberManagerAddress
    );
    const { gasConsumed, result, output } =
      await memberManagerContract.query.isMember(
        peformanceAddress,
        {
          value: 0,
          gasLimit: -1,
        },
        item.daoAddress
      );

    if (output !== undefined && output !== null) {
      if (output.toHuman()?.toString() == "true") {
        itemWithFlg.isMember = true;
      } else {
        itemWithFlg.isMember = false;
      }

      response.push(itemWithFlg);
    }
  }
  api.disconnect();
  return response;
};

export const deploySubDAO = async (
  performingAccount: InjectedAccountWithMeta,
  inputData: SubDAODeployFormData,
  setDaoAddress: (address: string) => void,
  setShowDaoAddress: (address: string) => void,
  setFinished: (value: boolean) => void
) => {
  console.log("#### deploySubDAO pass 1");
  const wsProvider = new WsProvider(blockchainUrl);
  const api = await ApiPromise.create({ provider: wsProvider });
  console.log("#### deploySubDAO pass 2");

  console.log("### performingAccount: ", performingAccount);

  let subDAOContractAddess = "";
  const { web3FromSource } = await import("@polkadot/extension-dapp");
  const contractWasm = daoContractWasm.source.wasm;
  const contract = new CodePromise(api, daoAbi, contractWasm);
  const injector = await web3FromSource(performingAccount.meta.source);
  const tx = contract.tx.new(
    { gasLimit, storageDepositLimit },
    daoManagerAddress,
    inputData.name,
    inputData.githubUrl,
    inputData.description
  );
  console.log("#### deploySubDAO pass 3");
  const unsub = await tx.signAndSend(
    performingAccount.address,
    { signer: injector.signer },
    ({ contract, status }) => {
      if (status.isInBlock || status.isFinalized) {
        console.log("#### deploySubDAO pass 4");
        subDAOContractAddess = contract.address.toString();
        console.log("### subDAOContractAddess: ", subDAOContractAddess);
        setDaoAddress(subDAOContractAddess);
        setShowDaoAddress(subDAOContractAddess);
        setFinished(true);
        unsub();
        api.disconnect();
      } else {
        console.log("## status: ", status.toHuman()?.toString());
      }
    }
  );
};

export const registerToDaoManager = async (
  performingAccount: InjectedAccountWithMeta,
  daoAddress: string,
  setFinished: (value: boolean) => void
) => {
  const { web3FromSource } = await import("@polkadot/extension-dapp");
  const wsProvider = new WsProvider(blockchainUrl);
  const api = await ApiPromise.create({ provider: wsProvider });

  const contract = new ContractPromise(api, daoManagerAbi, daoManagerAddress);
  const injector = await web3FromSource(performingAccount.meta.source);
  const tx = await contract.tx.addDao({ value: 0, gasLimit: -1 }, daoAddress);
  if (injector !== undefined) {
    const unsub = await tx.signAndSend(
      performingAccount.address,
      { signer: injector.signer },
      (result) => {
        if (result.status.isFinalized) {
          setFinished(true);
          unsub();
          api.disconnect();
        }
      }
    );
  }
};

export const doDonateSubDao = async (subDaoAddress: string, amount: number) => {
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
      .donate({ value: ethers.utils.parseEther(String(amount)) })
      .catch((err: any) => {
        console.log(err);
        errorFunction(err);
      });
  }
};

export const getDaoBalance = async (peformanceAddress: string, daoAddress: string): Promise<number> => {
  let response: number = 0;
  const wsProvider = new WsProvider(blockchainUrl);
  const api = await ApiPromise.create({ provider: wsProvider });
  const daoContract = new ContractPromise(api, daoAbi, daoAddress);
  const { gasConsumed, result, output } = await daoContract.query.getContractBalance(
    peformanceAddress,
    {
      value: 0,
      gasLimit: -1,
    }
  );
  if (output !== undefined && output !== null) {
    response = Number(output.toHuman()?.toString());
  }
  api.disconnect();

  return response;
};

export const getDaoName = async (
  peformanceAddress: string,
  daoAddress: string
): Promise<string> => {
  let res = "";
  const wsProvider = new WsProvider(blockchainUrl);
  const api = await ApiPromise.create({ provider: wsProvider });
  const daoContract = new ContractPromise(api, daoAbi, daoAddress);
  const { gasConsumed, result, output } = await daoContract.query.getDaoInfo(
    peformanceAddress,
    {
      value: 0,
      gasLimit: -1,
    }
  );
  if (output !== undefined && output !== null) {
    let response_json = output.toJSON();
    let json_data = JSON.parse(JSON.stringify(response_json));
    res = json_data.daoName;
  }
  api.disconnect();
  return res;
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

export const getTokenListWithName = async (
  tokenList: Array<TokenInfo>
): Promise<Array<TokenInfoWithName>> => {
  let response: TokenInfoWithName[] = [];
  const erc20contractDefine = DaoErc20Contract;
  const erc721contractDefine = DaoErc721Contract;
  const GovernaceTokenDefine = GovernaceTokenConstract;
  const provider = await detectEthereumProvider({ mustBeMetaMask: true });
  if (provider && window.ethereum?.isMetaMask) {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      for (var item of tokenList) {
        let commonContractDefine: any;
        if (item.tokenKind == TokenKind.ERC20) {
          commonContractDefine = erc20contractDefine;
        } else if (item.tokenKind == TokenKind.ERC721) {
          commonContractDefine = erc721contractDefine;
        } else {
          commonContractDefine = GovernaceTokenConstract;
        }
        const contract = new ethers.Contract(
          item.tokenAddress,
          commonContractDefine.abi,
          signer
        );
        let tokenName = await contract.name().catch((err: any) => {
          console.log(err);
          errorFunction(err);
        });
        let tokenSymbol = await contract.symbol().catch((err: any) => {
          console.log(err);
          errorFunction(err);
        });
        const pushItem: TokenInfoWithName = {
          tokenAddress: item.tokenAddress,
          tokenKind: item.tokenKind,
          tokenName: String(tokenName),
          tokenSymbol: String(tokenSymbol),
        };

        response.push(pushItem);
      }
    }
  } else {
    alert("Please instal metamask.");
  }

  return response;
};

export const divide = async (
  proposalId: string,
  daoAddress: string,
  targetAddress: string,
  amount: number
) => {
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
      .divide(
        targetAddress,
        ethers.utils.parseEther(String(amount)),
        proposalId
      )
      .catch((err: any) => {
        console.log(err);
        errorFunction(err);
      });
  }
};

export const addTokenToList = async (
  tokenKind: TokenKind,
  tokenAddress: string,
  daoAddress: string
) => {
  console.log("daoAddress:", daoAddress);
  const contractConstract = SubDAOContractConstruct;
  if (typeof window.ethereum !== "undefined" && daoAddress) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      daoAddress,
      contractConstract.abi,
      signer
    );
    await contract.addTokenToList(tokenKind, tokenAddress).catch((err: any) => {
      console.log(err);
      errorFunction(err);
    });
  }
};

export const getMemberNFTAddress = async (
  daoAddress: string
): Promise<string> => {
  console.log("daoAddress:", daoAddress);
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
    ret = await contract.getMemberNFTAddress().catch((err: any) => {
      console.log(err);
      errorFunction(err);
    });
  }
  return ret;
};
