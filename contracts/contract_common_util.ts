import { formatBalance } from "@polkadot/util";
import { ApiPromise, WsProvider } from "@polkadot/api";

export const checkAndCreateApiObject = async (
  api: any,
  setApi: (api: any) => void
): Promise<any> => {
  let apiObject: any = api;
  if (api == undefined) {
    const blockchainUrl = String(process.env.NEXT_PUBLIC_BLOCKCHAIN_URL) ?? "";
    const wsProvider = new WsProvider(blockchainUrl);
    apiObject = await ApiPromise.create({ provider: wsProvider });
    console.log("### pass SetApi:", apiObject);
    setApi(apiObject);
  }
  return apiObject;
};

export const checkEventsAndInculueError = (events: any[]): boolean => {
  let ret = false;
  events.forEach(({ event: { data } }) => {
    console.log("### data.methhod:", data.method);
    if (String(data.method) == "ExtrinsicFailed") {
      console.log("### check ExtrinsicFailed");
      ret = true;
    }
  });
  console.log("### ret is:", ret);
  return ret;
};

export const formatBalances = (balance: string, decimals: number): string => {
  console.log("### balance:", balance);
  console.log("### decimals:", decimals);

  return formatBalance(balance.replaceAll(",", ""), {
    withSi: false,
    forceUnit: "-",
    decimals: decimals,
  });
};
