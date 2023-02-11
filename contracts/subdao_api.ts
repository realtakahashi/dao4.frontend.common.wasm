import {
  ProposalData4ADivide,
  SubDAOData,
  SubDAODataWithMemberFlg,
  SubDAODeployFormData,
} from "../types/SubDaoType";
import {
  ProposalData4RegisterToken,
  TokenInfo,
  TokenInfoWithName,
  TokenKind,
} from "../types/Token";
import { ContractPromise, CodePromise } from "@polkadot/api-contract";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import daoManagerAbi from "../contracts/construct/DaoManager.json";
import daoAbi from "../contracts/construct/Dao.json";
import memberManagerAbi from "../contracts/construct/MemberManager.json";
import daoContractWasm from "../contracts/construct/Dao_contract.json";
import {
  checkEventsAndInculueError,
  formatBalances,
} from "./contract_common_util";
import { AddProposalFormData } from "../types/ProposalManagerType";
import { addProposal } from "./ProposalManagerApi";
import psp22Abi from "../contracts/construct/Psp22.json";
import psp34Abi from "../contracts/construct/Psp34.json";
import governnanceTokenAbi from "../contracts/construct/GovernanceToken.json";
import { BN } from "@polkadot/util";

const blockchainUrl = String(process.env.NEXT_PUBLIC_BLOCKCHAIN_URL) ?? "";
const daoManagerAddress =
  String(process.env.NEXT_PUBLIC_DAO_MANAGER_CONTRACT_ADDRESS) ?? "";
const memberManagerAddress =
  String(process.env.NEXT_PUBLIC_MEMBER_MANAGER_CONTRACT_ADDRESS) ?? "";

// const gasLimit = -1;
// const gasLimit = 100000 * 1000000;
const storageDepositLimit = null;

export const listDAOAddress = async (
  api: any,
  peformanceAddress: string
): Promise<Array<string>> => {
  let response: string[] = [];

  if (api == undefined) {
    return response;
  }

  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 6219235328,
    proofSize: 131072,
  });

  console.log("### pass listDAOAddress:", api);

  const daoManagerContract = new ContractPromise(
    api,
    daoManagerAbi,
    daoManagerAddress
  );
  const { gasConsumed, result, output } =
    await daoManagerContract.query.getDaoList(peformanceAddress, {
      value: 0,
      gasLimit: gasLimit,
    });
  if (output !== undefined && output !== null) {
    let response_json = output.toJSON();
    let json_data = JSON.parse(JSON.stringify(response_json));
    for (let i = 0; i < json_data.length; i++) {
      let item = json_data[i];
      response.push(item);
    }
  }
  return response;
};

export const listSubDAO = async (
  api:any,
  peformanceAddress: string,
  daoAddressList: string[]
): Promise<Array<SubDAOData>> => {
  let response: SubDAOData[] = [];

  if (daoAddressList.length == 0){
    return response;
  }

  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 6219235328,
    proofSize: 131072,
  });

  for (let i = 0; i < daoAddressList.length; i++) {
    const daoContract = new ContractPromise(api, daoAbi, daoAddressList[i]);
    const { gasConsumed, result, output } = await daoContract.query.getDaoInfo(
      peformanceAddress,
      {
        value: 0,
        gasLimit: gasLimit,
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
  return response;
};

export const getDaoListOfAffiliation = async (
  api:any,
  peformanceAddress: string,
  subDaoList: Array<SubDAOData>
): Promise<Array<SubDAODataWithMemberFlg>> => {
  let response: SubDAODataWithMemberFlg[] = [];

  if (subDaoList.length == 0) {
    return response;
  }

  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 6219235328,
    proofSize: 131072,
  });

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
          gasLimit: gasLimit,
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
  return response;
};

export const deploySubDAO = async (
  api:any,
  performingAccount: InjectedAccountWithMeta,
  inputData: SubDAODeployFormData,
  setDaoAddress: (address: string) => void,
  setShowDaoAddress: (address: string) => void,
  setFinished: (value: boolean) => void
) => {
  let subDAOContractAddess = "";
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });
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
  const unsub = await tx.signAndSend(
    performingAccount.address,
    { signer: injector.signer },
    // check compile error
    ({ events = [], contract, status }) => {
      if (status.isFinalized) {
        if (checkEventsAndInculueError(events)) {
          alert("Transaction is failure.");
        } else {
          subDAOContractAddess = contract.address.toString();
          setDaoAddress(subDAOContractAddess);
          setShowDaoAddress(subDAOContractAddess);
          setFinished(true);
        }
        unsub();
      }
    }
  );
};

export const registerToDaoManager = async (
  api:any,
  performingAccount: InjectedAccountWithMeta,
  daoAddress: string,
  setFinished: (value: boolean) => void
) => {
  console.log("### performingAccount.address:", performingAccount.address);
  console.log("### daoAddress:", daoAddress);
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 6219235328,
    proofSize: 131072,
  });
  const { web3FromSource } = await import("@polkadot/extension-dapp");

  const contract = new ContractPromise(api, daoManagerAbi, daoManagerAddress);
  const injector = await web3FromSource(performingAccount.meta.source);
  const tx = await contract.tx.addDao(
    { value: 0, gasLimit: gasLimit },
    daoAddress
  );
  if (injector !== undefined) {
    const unsub = await tx.signAndSend(
      performingAccount.address,
      { signer: injector.signer },
      ({ status, events = [] }) => {
        if (status.isFinalized) {
          if (checkEventsAndInculueError(events)) {
            alert("Transaction is failure.");
          }
          setFinished(true);
          unsub();
        }
      }
    );
  }
};

export const doDonateSubDao = async (
  api:any,
  performingAccount: InjectedAccountWithMeta,
  daoAddress: string,
  amount: string
) => {
  const { web3FromSource } = await import("@polkadot/extension-dapp");
  const contract = new ContractPromise(api, daoAbi, daoAddress);
  const injector = await web3FromSource(performingAccount.meta.source);
  const decimals = api.registry.chainDecimals;
  const decimalAmount: Number = Number(amount) * 10 ** decimals[0];
  console.log("### decimalAmount:", decimalAmount.toString());
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 6219235328,
    proofSize: 131072,
  });
  const tx = await contract.tx.donateToTheDao({
    value: decimalAmount.toString(),
    gasLimit: gasLimit,
  });
  if (injector !== undefined) {
    const unsub = await tx.signAndSend(
      performingAccount.address,
      { signer: injector.signer },
      ({ status, events = [] }) => {
        if (status.isFinalized) {
          if (checkEventsAndInculueError(events)) {
            alert("Transaction is failure.");
          }
          unsub();
        }
      }
    );
  }
};

export const getDaoBalance = async (
  api:any,
  peformanceAddress: string,
  daoAddress: string
): Promise<string> => {
  let response: string = "0";
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 6219235328,
    proofSize: 131072,
  });
  const daoContract = new ContractPromise(api, daoAbi, daoAddress);
  const { gasConsumed, result, output } =
    await daoContract.query.getContractBalance(peformanceAddress, {
      value: 0,
      gasLimit: gasLimit,
    });
  if (output !== undefined && output !== null) {
    console.log("### dao balance is :", output.toHuman()?.toString());
    response = output.toHuman()?.toString() ?? "0";
    const decimals = api.registry.chainDecimals;
    response = formatBalances(response, decimals[0]);
  }

  return response;
};

export const getDaoName = async (
  api:any,
  peformanceAddress: string,
  daoAddress: string
): Promise<string> => {
  let res = "";
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 6219235328,
    proofSize: 131072,
  });
  const daoContract = new ContractPromise(api, daoAbi, daoAddress);
  const { gasConsumed, result, output } = await daoContract.query.getDaoInfo(
    peformanceAddress,
    {
      value: 0,
      gasLimit: gasLimit,
    }
  );
  if (output !== undefined && output !== null) {
    let response_json = output.toJSON();
    let json_data = JSON.parse(JSON.stringify(response_json));
    res = json_data.daoName;
  }
  return res;
};

export const getTokenList = async (
  api:any,
  peformanceAddress: string,
  daoAddress: string
): Promise<Array<TokenInfo>> => {
  let response: TokenInfo[] = [];

  console.log("### dao address:", daoAddress);
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 6219235328,
    proofSize: 131072,
  });
  const contract = new ContractPromise(api, daoAbi, daoAddress);
  const { gasConsumed, result, output } = await contract.query.getTokenList(
    peformanceAddress,
    {
      value: 0,
      gasLimit: gasLimit,
    }
  );
  if (output !== undefined && output !== null) {
    let response_json = output.toJSON();
    let json_data = JSON.parse(JSON.stringify(response_json));
    for (let i = 0; i < json_data.length; i++) {
      let item: TokenInfo = {
        tokenKind: convert_token_kind(json_data[i].tokenType),
        tokenAddress: json_data[i].tokenAddress,
      };
      response.push(item);
    }
  }
  return response;
};

const convert_token_kind = (value_string: string): TokenKind => {
  if (value_string == "GovernanceToken") {
    return TokenKind.GOVERNANCE;
  } else if (value_string == "Psp22") {
    return TokenKind.ERC20;
  } else if (value_string == "Psp34") {
    return TokenKind.ERC721;
  } else {
    return TokenKind.None;
  }
};

export const getTokenListWithName = async (
  api:any,
  peformanceAddress: string,
  tokenList: Array<TokenInfo>
): Promise<Array<TokenInfoWithName>> => {
  let response: TokenInfoWithName[] = [];

  let contract;

  for (var item of tokenList) {
    let tokenName = "";
    let tokenSymbol = "";
    let decimal = "";
    switch (item.tokenKind) {
      case TokenKind.ERC20:
        tokenName = await getPsp22Value(
          api,
          peformanceAddress,
          item.tokenAddress,
          "psp22Metadata::tokenName"
        );
        tokenSymbol = await getPsp22Value(
          api,
          peformanceAddress,
          item.tokenAddress,
          "psp22Metadata::tokenSymbol"
        );
        decimal = await getPsp22Value(
          api,
          peformanceAddress,
          item.tokenAddress,
          "psp22Metadata::tokenDecimals"
        );
        break;
      case TokenKind.GOVERNANCE:
        tokenName = await getGovernanceValue(
          api,
          peformanceAddress,
          item.tokenAddress,
          "psp22Metadata::tokenName"
        );
        tokenSymbol = await getGovernanceValue(
          api,
          peformanceAddress,
          item.tokenAddress,
          "psp22Metadata::tokenSymbol"
        );
        decimal = await getPsp22Value(
          api,
          peformanceAddress,
          item.tokenAddress,
          "psp22Metadata::tokenDecimals"
        );
        break;
      case TokenKind.ERC721:
        tokenName = await getPsp34Value(
          api,
          peformanceAddress,
          item.tokenAddress,
          "psp34Metadata::getAttribute",
          "name"
        );
        tokenSymbol = await getPsp34Value(
          api,
          peformanceAddress,
          item.tokenAddress,
          "psp34Metadata::getAttribute",
          "symbol"
        );
        break;
      default:
        alert("Unexpected Error.");
        return response;
    }
    const pushItem: TokenInfoWithName = {
      tokenAddress: item.tokenAddress,
      tokenKind: item.tokenKind,
      tokenName: String(tokenName),
      tokenSymbol: String(tokenSymbol),
      decimal: decimal,
    };
    response.push(pushItem);
  }
  return response;
};

const getPsp22Value = async (
  api:any,
  peformanceAddress: string,
  tokenAddress: string,
  functionName: string
): Promise<string> => {
  let res: string = "";
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 6219235328,
    proofSize: 131072,
  });
  const contract = new ContractPromise(api, psp22Abi, tokenAddress);
  const { output } = await contract.query[functionName](peformanceAddress, {
    value: 0,
    gasLimit: gasLimit,
  });
  if (output !== undefined && output !== null) {
    res = output.toHuman()?.toString() ?? "";
  }
  return res;
};

const getGovernanceValue = async (
  api:any,
  peformanceAddress: string,
  tokenAddress: string,
  functionName: string
): Promise<string> => {
  let res: string = "";
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 6219235328,
    proofSize: 131072,
  });
  const contract = new ContractPromise(api, governnanceTokenAbi, tokenAddress);
  const { output } = await contract.query[functionName](peformanceAddress, {
    value: 0,
    gasLimit: gasLimit,
  });
  if (output !== undefined && output !== null) {
    res = output.toHuman()?.toString() ?? "";
  }
  return res;
};

const getPsp34Value = async (
  api:any,
  peformanceAddress: string,
  tokenAddress: string,
  functionName: string,
  metaDataKey: string
): Promise<string> => {
  let res = "";
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 6219235328,
    proofSize: 131072,
  });
  const contract = new ContractPromise(api, psp34Abi, tokenAddress);
  const { output } = await contract.query[functionName](
    peformanceAddress,
    {
      value: 0,
      gasLimit: gasLimit,
    },
    0,
    metaDataKey
  );
  if (output !== undefined && output !== null) {
    res = output.toHuman()?.toString() ?? "";
  }
  return res;
};

export const createDivideProposal = async (
  api:any,
  performingAccount: InjectedAccountWithMeta,
  daoAddress: string,
  proposalData: ProposalData4ADivide
) => {
  const decimals = api.registry.chainDecimals;
  const decimalAmount: Number = Number(proposalData.amount) * 10 ** decimals[0];

  const csvData = proposalData.targetAddress + "," + decimalAmount.toString();
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

export const createProposal4AddingTokenToList = async (
  api:any,
  tokenKind: number,
  tokenAddress: string,
  performingAccount: InjectedAccountWithMeta,
  daoAddress: string,
  proposalData: ProposalData4RegisterToken
) => {
  console.log("### createProposal4AddingTokenToList pass 1");
  const csvData = tokenAddress + "," + String(tokenKind);
  const proposalParameter: AddProposalFormData = {
    proposalKind: proposalData.proposalKind,
    title: proposalData.title,
    outline: proposalData.outline,
    githubURL: proposalData.githubURL,
    detail: proposalData.detail,
    csvData: csvData,
  };
  console.log("### createProposal4AddingTokenToList pass 2");
  await addProposal(api,performingAccount, proposalParameter, daoAddress);
  console.log("### createProposal4AddingTokenToList pass 3");
};

