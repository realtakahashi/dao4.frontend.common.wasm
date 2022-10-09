import { useState } from "react";
import { useEffect } from "react";
import { ethers } from "ethers";
//import { getMasterDaoBalance } from "../contracts/masterdao_api";
import { getDaoBalance } from "../contracts/subdao_api";
import { get_account_info, get_selected_address } from "../contracts/get_account_info_api";

interface DaoBalanceParameter {
  daoAddress: string;
  isMasterDao: boolean;
}

const DaoBalance = (props: DaoBalanceParameter) => {
  const [showBalance, setShowBalance] = useState(0);

  const _getBalance = async () => {
    const selectedAccount = await get_account_info(get_selected_address());
    let ret: number = 0;
    if (props.isMasterDao) {
//      ret = await getMasterDaoBalance();
    } else {
      ret = await getDaoBalance(selectedAccount.address, props.daoAddress);
    }
    // console.log("### balance:", ret);
    if (typeof ret === "undefined") {
      ret = 0;
    }
    setShowBalance(ret);
  };

  useEffect(() => {
    _getBalance();
  });

  return (
    <label className="text-white text-50px">
      Balance: {ethers.utils.formatEther(showBalance)} SDN
    </label>
  );
};

export default DaoBalance;
