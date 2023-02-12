import { BN } from "@polkadot/util";

export const errorFunction=(err:any)=>{
    if (
        typeof err.data !== "undefined" &&
        typeof err.data.message !== "undefined"
      ) {
        alert(err.data.message);
      } else if (typeof err.message !== "undefined") {
        alert(err.message);
      } else {
        alert("transaction error is occuered.");
      }
}

export const getGasLimitForNotDeploy = (api:any):any => {
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: new BN("100000000000"),
    proofSize: new BN("100000000000"),
    // refTime: 6219235328,
    // proofSize: 131072,
  });
  return gasLimit;
}