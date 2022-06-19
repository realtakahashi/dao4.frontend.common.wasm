import { Settings } from "http2";

export interface MemberInfo {
  name: string;
  eoaAddress: string;
  memberId: Number;
  tokenId: Number;
}

export interface MemberInfoPlus {
  name: string;
  eoaAddress: string;
  memberId: Number;
  tokenId: Number;
  isElectionCommition: boolean;
}

export interface FirstMemberData {
  ownerName: string;
  tokenId: Number;
}

export interface MemberFormData {
  name: string;
  memberAddress: string;
  proposalId: Number;
}

export interface MemberFormDataForDao {
  name: string;
  memberAddress: string;
  proposalId: Number;
  targetDaoAddress:string;
  tokenId:Number;
  tokenAddress:string;
}

export interface ElectionComissionFormData {
  candidateEoa_one: string;
  candidateEoa_two: string;
  relatedProposalId_one: Number;
  relatedProposalId_two: Number;
}
