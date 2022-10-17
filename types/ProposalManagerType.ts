export interface ProposalProps {
  targetProposal: ProposalInfo;
  daoAddress: string;
}

export interface ApproveDaoData {
  relatedProposalId: number;
  doReward: boolean;
}

export interface AddProposalData {
  proposalKind: number;
  title: string;
  outline: string;
  detail: string;
  githubURL: string;
}

export interface AddProposalFormData {
  proposalKind: number;
  title: string;
  outline: string;
  detail: string;
  githubURL: string;
  csvData: string;
}

export interface ProposalInfo {
  proposalKind: string;
  proposalId: string;
  proposer: string;
  title: string;
  outline: string;
  details: string;
  proposalStatus: string;
  githubURL: string;
  csvData: string,
}

export const PROPOSAL_KIND = [
  "AddMember",
  "DeleteMember",
  "ChangeElectoralCommissioner",
  "UseDaoTresury",
  "IssueToken",
  "ChangeStatusOfTokenSale",
  "WithdrawTokenSales",
  "DistributeGovernanceToken",
] as const;

export const PROPOSAL_STATUS = [
  "UnderDiscussionOnGithub",
  "Voting",
  "Pending",
  "Running",
  "Rejected",
  "FinishedVoting",
  "Finished",
] as const;

export const PROPOSAL_VOTING = 2;
export const PROPOSAL_FINISHED = 3;
export const PROPOSAL_REJECTED= 5;
