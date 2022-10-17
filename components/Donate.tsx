import { useState } from "react";
import { TargetDaoInterface } from "../types/MasterDaoType";
import TargetDao from "./TargetDao";
import { TargetDaoKind } from "../types/MasterDaoType";
import { doDonateSubDao } from "../contracts/subdao_api";
import { get_account_info, get_selected_address } from "../contracts/get_account_info_api";

const Donate = (props: TargetDaoInterface) => {
  const [donateAmount, setDonateAmount] = useState(0);
  const _doDonateFromIndividials =async () => {
    const selectedAddress = await get_account_info(get_selected_address());
    await doDonateSubDao(selectedAddress,props.daoAddress,donateAmount)
  }

  return (
    <>
      <div className="flex justify-center">
        <label className="text-indigo-300 text-24px">
        About to donate to DAO:
        </label>
      </div>
      <div className="p-1"></div>
      <div className="flex justify-center">
        <table>
          <TargetDao
            daoAddress={props.daoAddress}
            daoName={props.daoName}
            targetDaoKind={TargetDaoKind.NONE}
          ></TargetDao>
          <tr>
            <th className="flex justify-end px-4 py-5 text-white text-24px">
              Donate Amount:{" "}
            </th>
            <td className="text-white text-18px">
              <input
                className="text-black text-14px px-2 py-1"
                onChange={(e) => setDonateAmount(Number(e.target.value))}
              ></input>{" "}
              SDN
            </td>
          </tr>
        </table>
      </div>
      <div className="p-3"></div>
      {props.targetDaoKind == TargetDaoKind.TARGET_DAO_FROM_INDIVIDIALS && (
        <div className="flex justify-center">
          <button
            className="m-2 px-4 py-2  border-black border-2 bg-blue-200 rounded text-black  hover:bg-green-200"
            onClick={() => _doDonateFromIndividials()}
          >
            Execute
          </button>
        </div>
      )}
    </>
  );
};

export default Donate;
