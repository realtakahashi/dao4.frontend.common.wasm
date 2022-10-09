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
  proposalKind: number;
  title: string;
  outline: string;
  details: string;
  githubURL: string;
  proposalId: string;
  relatedId: string;
  relatedAddress: string;
  proposalStatus: number;
}

export const PROPOSAL_KIND = [
  "AddAMember",
  "DeleteAMember",
  "UseOfFunds",
  "CommunityManagement",
  "Activities",
  "ElectionComissionPropsal",
  "DaoReward"
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

export const PROPOSAL_VOTING = 1;
export const PROPOSAL_FINISHED = 6;
export const PROPOSAL_REJECTED= 4;
