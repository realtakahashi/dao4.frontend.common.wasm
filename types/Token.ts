export const enum TokenKind {
  ERC20,
  ERC721,
  None,
}

export interface TokenInfo {
  tokenKind: TokenKind;
  tokenAddress: string;
}
