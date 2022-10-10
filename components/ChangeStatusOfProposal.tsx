import { useState } from "react";
import { changeProposalStatus } from "../contracts/ProposalManagerApi";
import { ProposalProps } from "../types/ProposalManagerType";
import ProposalParts from "./ProposalParts";

const ChangeStatusOfProposal = (props: ProposalProps) => {
  const [changeStatus, setChangeStatus] = useState("0");

  const selectChangeStatus = (status: string) => {
    setChangeStatus(status);
  };

  const doChangeStatus = async () => {
    await changeProposalStatus(
      Number(changeStatus),
      Number(props.targetProposal.proposalId),
      props.daoAddress
    );
  };

  return (
    <>
      <div className="flex justify-center">
        <div
          className="m-5  max-w-sm rounded overflow-hidden shadow-lg bg-black border-4 border-white"
          key={props.targetProposal.title}
        >
          <ProposalParts targetProposal={props.targetProposal} daoAddress={props.daoAddress}></ProposalParts>
          <label className="text-15px text-blue-400 px-4 py-5">
            Change To :
          </label>
          <select
            className="font-bold"
            name="Status"
            value={changeStatus}
            onChange={(e) => selectChangeStatus(e.target.value)}
          >
            <option value="2">Voting</option>
            <option value="3">FinishVoting</option>
          </select>
          <div className="p-3"></div>
        </div>
      </div>
      <div className="flex justify-center">
        <button
          className="m-2 px-4 py-2  border-black border-2 bg-blue-200 rounded text-black  hover:bg-green-200"
          onClick={() => doChangeStatus()}
        >
          Change
        </button>
      </div>
    </>
  );
};

export default ChangeStatusOfProposal;
