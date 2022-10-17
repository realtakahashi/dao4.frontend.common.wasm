export interface SubDAODeployFormData {
  name: string;
  githubUrl: string;
  description: string;
}

export interface SubDAOData {
  daoAddress: string;
  daoName: string;
  githubURL: string;
  description: string;
}

export interface SubDAODataWithMemberFlg {
  daoAddress: string;
  daoName: string;
  githubURL: string;
  description: string;
  isMember:boolean;
}

export interface ProposalData4ADivide {
  amount: number,
  targetAddress: string,
  proposalKind: number,
  title: string,
  outline: string,
  githubURL: string,
  detail: string,
}

export const enum TargetDaoKind{
  MASTER_DAO,
  TARGET_DAO_FROM_MASTER_DAO,
  TARGET_DAO_FROM_INDIVIDIALS,
  NONE,
}

export interface TargetDaoInterface {
  daoAddress: string;
  daoName: string;
  targetDaoKind:TargetDaoKind;
}

