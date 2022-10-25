import { useState, useContext } from "react";
import { useEffect } from "react";
import { getDaoBalance } from "../contracts/subdao_api";
import { get_account_info, get_selected_address } from "../contracts/get_account_info_api";
import { AppContext } from "../../pages/_app";

interface DaoBalanceParameter {
  daoAddress: string;
  isMasterDao: boolean;
}

const DaoBalance = (props: DaoBalanceParameter) => {
  const [showBalance, setShowBalance] = useState("0");
  const {api} = useContext(AppContext);

  const _getBalance = async () => {
    const selectedAccount = await get_account_info(get_selected_address());
    let ret = "0";
    if (props.isMasterDao) {
//      ret = await getMasterDaoBalance();
    } else {
      ret = await getDaoBalance(api, selectedAccount.address, props.daoAddress);
    }
    // console.log("### balance:", ret);
    if (typeof ret === "undefined") {
      ret = "0";
    }
    setShowBalance(ret);
  };

  useEffect(() => {
    _getBalance();
  });

  return (
    <label className="text-white text-50px">
      Balance: {showBalance} SDN
    </label>
  );
};

export default DaoBalance;
