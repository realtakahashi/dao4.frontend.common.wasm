export const enum TokenKind {
  ERC20,
  ERC721,
  GOVERNANCE,
  None,
}

export interface TokenInfo {
  tokenKind: TokenKind;
  tokenAddress: string;
}

export interface Erc20DeployData {
  tokenName: string;
  tokenSymbol: string;
  daoAddress: string;
  price: number;
  initialSupply: number;
  decimal:number;
}

export interface ProposalData4RegisterToken {
  proposalKind: number;
  title: string;
  outline: string;
  githubURL: string;
  detail: string;
}

export interface GovernanceDeployData {
  tokenName: string;
  tokenSymbol: string;
  daoAddress: string;
  initialSupply: number;
  decimal:number;
}

export interface Erc721DeployData {
  tokenName: string;
  tokenSymbol: string;
  daoAddress: string;
  price: number;
  baseUri: string;
}

export interface TokenInfoWithName {
  tokenKind: TokenKind;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  decimal: string;
}

export interface ProposalData4ChangingTokenSaleStatus {
  tokenSaleStatus: boolean;
  proposalKind: number;
  title: string;
  outline: string;
  githubURL: string;
  detail: string;
}

export interface ProposalData4TransferGovernanceToken {
  toListCsv:string;
  amountListCsv:string;
  proposalKind: number;
  title: string;
  outline: string;
  githubURL: string;
  detail: string;
}
