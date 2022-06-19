import { useState } from "react";
import { TargetDaoInterface } from "../types/MasterDaoType";
import TargetDao from "./TargetDao";
import { TargetDaoKind } from "../types/MasterDaoType";
import { divide } from "../contracts/subdao_api";

const Divide = (props: TargetDaoInterface) => {
  const [divideAmount, setDivideAmount] = useState(0);
  const [proposalId, setProposalId] = useState("0");
  const [targetAddress,setTargetAddress] = useState("");

  const _doDivide = async () => {
    await divide(proposalId,props.daoAddress,targetAddress,divideAmount);
  };

  return (
    <>
      <div className="flex justify-center">
        <label className="text-indigo-300 text-24px">
          You are trying to divide native tokens for the following Address:
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
                Proposal Id:{" "}
              </th>
              <td>
                <input
                  className="text-black text-14px px-2 py-1"
                  onChange={(e) => setProposalId(e.target.value)}
                ></input>
              </td>
            </tr>
          <tr>
            <th className="flex justify-end px-4 py-5 text-white text-24px">
              Divide Amount:{" "}
            </th>
            <td className="text-white text-18px">
              <input
                className="text-black text-14px px-2 py-1"
                onChange={(e) => setDivideAmount(Number(e.target.value))}
              ></input>{" "}
              SDN
            </td>
          </tr>
          <tr>
            <th className="flex justify-end px-4 py-5 text-white text-24px">
              Target Address:{" "}
            </th>
            <td className="text-white text-18px">
              <input
                className="text-black text-14px px-2 py-1"
                onChange={(e) => setTargetAddress(e.target.value)}
              ></input>{" "}
            </td>
          </tr>
        </table>
      </div>
      <div className="p-3"></div>
        <div className="flex justify-center">
          <button
            className="m-2 px-4 py-2  border-black border-2 bg-blue-200 rounded text-black  hover:bg-green-200"
            onClick={() => _doDivide()}
          >
            Execute
          </button>
        </div>
    </>
  );
};

export default Divide;
