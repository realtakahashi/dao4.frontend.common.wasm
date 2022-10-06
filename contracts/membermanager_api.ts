import {
  ElectionComissionFormData,
  FirstMemberData,
  MemberFormDataForDao,
  MemberInfo,
  MemberInfoPlus,
} from "../types/MemberManagerType";
import MemberManagerContractConstruct from "./construct/MemberManager";
import { MemberFormData } from "../types/MemberManagerType";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { errorFunction } from "./commonFunctions";
import { checkNFTMinted } from "./member_nft_api";
import SubDAOContractConstruct from "./construct/SubDAOContractConstruct";

import { ApiPromise, WsProvider } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import memberManagerAbi from "../contracts/construct/MemberManager.json";

const blockchainUrl = String(process.env.NEXT_PUBLIC_BLOCKCHAIN_URL) ?? "";
const memberManagerAddress =
  String(process.env.NEXT_PUBLIC_MEMBER_MANAGER_CONTRACT_ADDRESS) ?? "";
const gasLimit = -1;
const storageDepositLimit = null;

export const getMemberList = async (
  memberManagerAddress: string,
  daoAddress: string
): Promise<Array<MemberInfoPlus>> => {
  const contractConstract = MemberManagerContractConstruct;
  //console.log("memberManager Address:",memberManagerAddress);

  let response: MemberInfo[] = [];
  let result: MemberInfoPlus[] = [];
  if (typeof window.ethereum !== "undefined" && memberManagerAddress) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      memberManagerAddress,
      contractConstract.abi,
      signer
    );
    await contract
      .getMemberList(daoAddress)
      .then((r: any) => {
        //console.log(r);
        response = r;
      })
      .catch((err: any) => {
        console.log(err);
        errorFunction(err);
      });

    console.log("## result:", result);
    console.log("## response:", response);
    for (var i = 0; i < response.length; i++) {
      const isElectionCommition = await contract.isElectionComission(
        daoAddress,
        response[i].eoaAddress
      );
      result.push({
        eoaAddress: response[i].eoaAddress,
        memberId: response[i].memberId,
        name: response[i].name,
        tokenId: response[i].tokenId,
        isElectionCommition: isElectionCommition,
      });
    }
  }

  return result;
};

export const checkElectionComission = async (
  memberManagerAddress: string,
  daoAddress: string
): Promise<boolean> => {
  const contractConstract = MemberManagerContractConstruct;

  let response: boolean = false;
  if (typeof window.ethereum !== "undefined" && memberManagerAddress) {
    console.log("## addmember 2");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      memberManagerAddress,
      contractConstract.abi,
      signer
    );
    await contract
      .isElectionComission(daoAddress, signer.getAddress())
      .then((r: any) => {
        response = r;
      })
      .catch((err: any) => {
        console.log(err);
        errorFunction(err);
      });
  }
  return response;
};

export const addFirstMember = async (
  performingAccount: InjectedAccountWithMeta,
  _memberFormData: FirstMemberData,
  daoAddress: string,
  setFinished:(value:boolean) => void
) => {
  const { web3FromSource } = await import("@polkadot/extension-dapp");
  const wsProvider = new WsProvider(blockchainUrl);
  const api = await ApiPromise.create({ provider: wsProvider });

  const contract = new ContractPromise(api, memberManagerAbi, memberManagerAddress);
  const injector = await web3FromSource(performingAccount.meta.source);
  const tx = await contract.tx.addFirstMember(
    { value: 0, gasLimit: -1 },
    daoAddress,
    performingAccount.address,
    _memberFormData.ownerName,
    0
  );
  if (injector !== undefined) {
    const unsub = await tx.signAndSend(performingAccount.address, { signer: injector.signer }, (result) => {
      if (result.status.isFinalized) {
        setFinished(true);
        unsub();
        api.disconnect();
      }
    });
  }

};


// export const addFirstMember = async (
//   _memberFormData: FirstMemberData,
//   memberManagerAddress: string,
//   daoAddress: string,
//   setFinished:(value:boolean) => void
// ) => {
//   const contractConstract = MemberManagerContractConstruct;

//   console.log("######## daoAddress:", daoAddress);
//   console.log("######## _memberFormData.ownerName:", _memberFormData.ownerName);
//   console.log("######## _memberFormData.tokenId", _memberFormData.tokenId);

//   if (typeof window.ethereum !== "undefined" && memberManagerAddress) {
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     const signer = provider.getSigner();
//     const contract = new ethers.Contract(
//       memberManagerAddress,
//       contractConstract.abi,
//       signer
//     );
//     const tx = await contract
//       .addFirstMember(
//         daoAddress,
//         _memberFormData.ownerName,
//         _memberFormData.tokenId
//       )
//       .catch((err: any) => {
//         console.log(err);
//         errorFunction(err);
//       });
//     const ret = tx.wait();
//     setFinished(true);
//   }
// };

export const addMember = async (
  _memberFormData: MemberFormData,
  memberManagerAddress: string,
  daoAddress: string
) => {
  const contractConstract = MemberManagerContractConstruct;

  console.log("## addmember 1");

  if (typeof window.ethereum !== "undefined" && memberManagerAddress) {
    console.log("## addmember 2");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      memberManagerAddress,
      contractConstract.abi,
      signer
    );
    await contract
      .addMember(
        daoAddress,
        _memberFormData.name,
        _memberFormData.memberAddress,
        _memberFormData.proposalId,
        "0"
      )
      .catch((err: any) => {
        console.log(err);
        errorFunction(err);
      });
  }
};

export const addMemberForDao = async (
  memberManagerAddress: string,
  param: MemberFormDataForDao,
  setFinished:(value:boolean) => void
) => {
  const memberContractConstract = MemberManagerContractConstruct;
  if (typeof window.ethereum !== "undefined" && param.targetDaoAddress) {
    console.log("## addmember 2");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const memberContract = new ethers.Contract(
      memberManagerAddress,
      memberContractConstract.abi,
      signer
    );

    if ((await checkNFTMinted(param.tokenAddress)) == "") {
      alert("You still not mint your own Member Token.");
      return;
    }

    console.log("## memberManagerAddress:",memberManagerAddress);
    console.log("## param.targetDaoAddress:",param.targetDaoAddress);
    console.log("## param.name:",param.name);
    console.log("## signer.getAddress:",signer.getAddress());
    console.log("## param.proposalId:",param.proposalId);
    console.log("## param.tokenId:",param.tokenId);

    const tx = await memberContract
      .addMember(
        param.targetDaoAddress,
        param.name,
        signer.getAddress(),
        param.proposalId,
        param.tokenId
      )
      .catch((err: any) => {
        console.log(err);
        errorFunction(err);
      });
    const ret = await tx.wait();
    setFinished(true);
  }
};

export const _resetElectionComission = async (
  _electionComissionData: ElectionComissionFormData,
  memberManagerAddress: string,
  daoAddress: string
) => {
  const contractConstract = MemberManagerContractConstruct;

  if (typeof window.ethereum !== "undefined" && memberManagerAddress) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      memberManagerAddress,
      contractConstract.abi,
      signer
    );

    console.log("## _electionComissionData", _electionComissionData);
    let _candidateEoaTwo = "";
    let _relatedProposalId_two = 0;
    if (_electionComissionData.candidateEoa_two != "") {
      console.log("## not Space");
      _candidateEoaTwo = _electionComissionData.candidateEoa_two;
      _relatedProposalId_two = Number(
        _electionComissionData.relatedProposalId_two
      );
    } else {
      console.log("##  Space");
      _candidateEoaTwo = "0x0000000000000000000000000000000000000000";
      _relatedProposalId_two = 0;
    }

    await contract
      .resetElectionCommision(
        daoAddress,
        _electionComissionData.candidateEoa_one,
        _candidateEoaTwo,
        _electionComissionData.relatedProposalId_one,
        _relatedProposalId_two
      )
      .catch((err: any) => {
        console.log(err);
        errorFunction(err);
      });
  }
};

export const deleteMember = async (
  _memberInfoData: MemberInfo,
  _proposalId: number,
  memberManagerAddress: string,
  daoAddress: string
) => {
  const contractConstract = MemberManagerContractConstruct;

  console.log("## masterDAOAddress:", daoAddress);
  console.log("## memberinfo:", _memberInfoData);
  console.log("## proposalId:", _proposalId);
  if (typeof window.ethereum !== "undefined" && memberManagerAddress) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      memberManagerAddress,
      contractConstract.abi,
      signer
    );
    await contract
      .deleteMember(daoAddress, _memberInfoData.eoaAddress, _proposalId)
      .catch((err: any) => {
        console.log(err);
        errorFunction(err);
      });
  }
};
