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
}

export interface GovernanceDeployData {
  tokenName: string;
  tokenSymbol: string;
  daoAddress: string;
}

export interface Erc721DeployData {
  tokenName: string;
  tokenSymbol: string;
  daoAddress: string;
  priceWei:number;
  baseUri:string;
}

export interface TokenInfoWithName {
  tokenKind: TokenKind;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
}

export interface MintInfo {
  price:number;
  amount:number;
}

export interface TransferInfo {
  amount:number;
  to:string;
}
