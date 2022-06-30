import Web3 from "web3";
import { ethers } from "ethers";
import MemberERC721ContractConstruct from "../contracts/construct/MemberERC721ContractConstruct";
import { MemberNFTDeployFormData } from "../types/MemberNftType";
import detectEthereumProvider from "@metamask/detect-provider";
import { errorFunction } from "./commonFunctions";
import { getContractAddress } from "ethers/lib/utils";

const DEPOSIT_TOKEN_BALANCE = "2";

export const deployMemberNFT = async (
  inputData: MemberNFTDeployFormData,
  setNftAddress: (value: string) => void,
  setFinished: (value:boolean) => void
): Promise<string> => {
  let memberNFTTokenAddress = "";
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const factory = new ethers.ContractFactory(
      MemberERC721ContractConstruct.abi,
      MemberERC721ContractConstruct.bytecode,
      signer
    );
    const tx: any = await factory
      .deploy(inputData.name, inputData.symbol, inputData.tokenURI)
      // .then((res: any) => {
      //   memberNFTTokenAddress = res.address;
      //   return memberNFTTokenAddress;
      // })
      .catch((err: any) => {
        errorFunction(err);
      });
    //console.log("## tx:",tx);
    memberNFTTokenAddress = tx.address;
    const ret = await tx.deployed();
    setFinished(true);

  }
  console.log("### memberNFTTokenAddress:", memberNFTTokenAddress);
  setNftAddress(memberNFTTokenAddress);
  return memberNFTTokenAddress;
};

export const mintMemberNFT = async (
  memberNFTTokenAddress: string,
  setTokenId: (id: string) => void,
  setFinished: (value: boolean) => void
): Promise<string> => {
  let id: Number = 0;
  console.log("memberNFT address: ", memberNFTTokenAddress);
  if (
    typeof window.ethereum !== "undefined" &&
    typeof memberNFTTokenAddress !== "undefined"
  ) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();
    const contract = new ethers.Contract(
      memberNFTTokenAddress,
      MemberERC721ContractConstruct.abi,
      signer
    );

    const tx = await contract
      .original_mint(signerAddress, {
        value: Web3.utils.toWei(DEPOSIT_TOKEN_BALANCE),
      })
      .catch((err: any) => {
        errorFunction(err);
      });
    if (tx !== undefined) {
      const ret = await tx.wait();
      console.log("ret.events:", ret.events);
      console.log("tokenId hex", ret.events[0].args.tokenId);
      console.log("tokenid:", String(Number(ret.events[0].args.tokenId)));
      id = Number(ret.events[0].args.tokenId);
      setTokenId(id.toString());
      setFinished(true);
      alert("Your Token Id is :" + id);
    }
  }
  return id.toString();
};

export const checkNFTMinted = async (
  memberNFTTokenAddress: string
): Promise<string> => {
  if (
    typeof window.ethereum !== "undefined" &&
    typeof memberNFTTokenAddress !== "undefined"
  ) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();
    const contract = new ethers.Contract(
      memberNFTTokenAddress,
      MemberERC721ContractConstruct.abi,
      signer
    );
    let id = "";
    let nId = await contract.ownedTokenId(signerAddress);
    if (nId != 0) {
      //      alert("You are already minted.Your Token Id is:" + nId);
      id = String(nId);
    }
    return id;
  }
  return "";
};
