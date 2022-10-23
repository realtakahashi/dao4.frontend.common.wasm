import { formatBalance } from "@polkadot/util";

export const checkEventsAndInculueError = (events: any[]): boolean => {
  events.forEach(({ event: { data } }) => {
    console.log("### data.methhod:", data.method);
    if (data.method == "ExtrinsicFailed") {
      return true;
    }
  });
  return false;
};

export const formatBalances = (balance: string, decimals: number): string => {
  console.log("### balance:",balance);
  console.log("### decimals:",decimals);

  return formatBalance(balance.replaceAll(",",""), {
    withSi: false,
    forceUnit: "-",
    decimals: decimals,
  });
};
