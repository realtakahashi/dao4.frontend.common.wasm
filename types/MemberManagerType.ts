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

export interface ProposalData4AddingMember {
  name:string;
  memberAddress:string;
  proposalKind: number,
  title: string,
  outline: string,
  githubURL: string,
  detail: string,
}

export interface MemberFormDataForDao {
  name: string;
  memberAddress: string;
  proposalId: Number;
  targetDaoAddress:string;
  tokenId:Number;
  tokenAddress:string;
}

export interface PropsalData4ElectionComission {
  candidateEoa_one: string;
  candidateEoa_two: string;
  proposalKind: number,
  title: string,
  outline: string,
  githubURL: string,
  detail: string,
}
