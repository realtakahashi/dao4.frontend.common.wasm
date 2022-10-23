import { useState } from "react";
import TargetDao from "./TargetDao";
import { createDivideProposal } from "../contracts/subdao_api";
import {
  TargetDaoKind,
  TargetDaoInterface,
  ProposalData4ADivide,
} from "../types/SubDaoType";
import {
  get_account_info,
  get_selected_address,
} from "../contracts/get_account_info_api";

const Divide = (props: TargetDaoInterface) => {
  const [proposalValue, setProposalValue] = useState<ProposalData4ADivide>({
    amount: 0,
    targetAddress: "",
    proposalKind: 3,
    title: "",
    outline: "",
    detail: "",
    githubURL: "",
  });

  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProposalValue({
      ...proposalValue,
      [event.target.name]: event.target.value,
    });
  };

  const onChangeText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProposalValue({
      ...proposalValue,
      [event.target.name]: event.target.value,
    });
  };

  const createProposal4Divide = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const selectedAccount = await get_account_info(get_selected_address());
    await createDivideProposal(
      selectedAccount,
      props.daoAddress,
      proposalValue
    );
  };

  return (
    <>
      <div className="flex justify-center">
        <label className="text-indigo-300 text-24px">
          You are trying to divide native tokens for the following Address:
        </label>
      </div>
      <div className="p-1"></div>
      <form className="" onSubmit={createProposal4Divide}>
        <div className="flex justify-center">
          <table>
            <TargetDao
              daoAddress={props.daoAddress}
              daoName={props.daoName}
              targetDaoKind={TargetDaoKind.NONE}
            ></TargetDao>
            <tr>
              <th className="flex justify-end px-4 py-5 text-white text-24px">
                Divide Amount:{" "}
              </th>
              <td className="text-white text-18px">
                <input
                  className="text-black text-14px px-2 py-1"
                  name="amount"
                  type="text"
                  onChange={onChangeInput}
                ></input>
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
                  name="targetAddress"
                  type="text"
                  onChange={onChangeInput}
                ></input>
              </td>
            </tr>
          </table>
        </div>
        <div className="m-5 flex justify-center text-24px text-blue-200">
          <label>Proposal Information</label>
        </div>
        <div className="p-2 m-5 flex flex-col">
          <table>
            <tr>
              <th className=" flex justify-end px-4 py-2 text-white">Title:</th>
              <td className=" px-4 py-2">
                <input
                  className="appearance-none rounded w-2/3 py-2 px-4 text-gray-700 
                        leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                  name="title"
                  type="text"
                  onChange={onChangeInput}
                ></input>
              </td>
            </tr>
            <tr>
              <th className="flex justify-end px-4 py-2 text-white">
                Outline:
              </th>
              <td className=" px-4 py-2">
                <textarea
                  className="appearance-none border-2 border-gray-200 rounded w-2/3 py-2 px-4 text-gray-700 
                        leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                  name="outline"
                  rows={5}
                  onInput={onChangeText}
                ></textarea>
              </td>
            </tr>
            <tr>
              <th className="flex justify-end px-4 py-2 text-white">Detail:</th>
              <td className=" px-4 py-2">
                <textarea
                  className="appearance-none border-2 border-gray-200 rounded w-2/3 py-2 px-4 text-gray-700 
                        leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                  name="detail"
                  rows={10}
                  onInput={onChangeText}
                ></textarea>
              </td>
            </tr>
            <tr>
              <th className="flex justify-end px-4 py-2 text-white">
                Github URL:
              </th>
              <td className=" px-4 py-2">
                <input
                  className="appearance-none border-2 border-gray-200 rounded w-2/3 py-2 px-4 text-gray-700 
                        leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                  name="githubURL"
                  type="text"
                  onChange={onChangeInput}
                ></input>
              </td>
            </tr>
          </table>
        </div>
        <div className="p-3"></div>
        <div className="flex justify-center">
          <button
            className="m-2 px-4 py-2  border-black border-2 bg-blue-200 rounded text-black  hover:bg-green-200"
            onClick={() => createProposal4Divide}
          >
            Create The Proposal
          </button>
        </div>
      </form>
    </>
  );
};

export default Divide;
