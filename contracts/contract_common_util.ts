import { formatBalance } from "@polkadot/util";

export const checkEventsAndInculueError = (events: any[]): boolean => {
  let ret = false;
  events.forEach(({ event: { data } }) => {
    console.log("### data.methhod:", data.method);
    if (String(data.method) == "ExtrinsicFailed") {
      console.log("### check ExtrinsicFailed");
      ret = true;
    }
  });
  console.log("### ret is:",ret);
  return ret;
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
