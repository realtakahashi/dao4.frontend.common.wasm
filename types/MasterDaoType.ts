export interface SubDAOData {
  ownerAddress: string;
  daoAddress: string;
  daoName: string;
  githubURL: string;
  description: string;
  rewardApproved: boolean;
}

export interface DonateInfo {
  amount: number;
  relatedProposalId: number;
}

// export const enum TargetDaoKind{
//   MASTER_DAO,
//   TARGET_DAO_FROM_MASTER_DAO,
//   TARGET_DAO_FROM_INDIVIDIALS,
//   NONE,
// }

// export interface TargetDaoInterface {
//   daoAddress: string;
//   daoName: string;
//   targetDaoKind:TargetDaoKind;
// }
