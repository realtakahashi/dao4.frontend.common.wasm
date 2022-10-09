import { useState } from "react";
import { ProposalData4AddingMember } from "../types/MemberManagerType";
import { propose4AddingTheMember } from "../contracts/membermanager_api";
import {
  get_account_info,
  get_selected_address,
} from "../contracts/get_account_info_api";

interface AddMemberParameter {
  daoAddress: string;
}

const AddMember = (props: AddMemberParameter) => {
  const [addMemberValue, setAddMemberValue] =
    useState<ProposalData4AddingMember>({
      name: "",
      memberAddress: "",
      proposalKind: 0,
      title: "",
      outline: "",
      detail: "",
      githubURL: "",
    });

  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddMemberValue({
      ...addMemberValue,
      [event.target.name]: event.target.value,
    });
  };

  const onChangeText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAddMemberValue({
      ...addMemberValue,
      [event.target.name]: event.target.value,
    });
  };

  const _onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    console.log("## _onSubmit 1");
    event.preventDefault();
    const selectedAccount = await get_account_info(get_selected_address());
    await propose4AddingTheMember(
      selectedAccount,
      addMemberValue,
      props.daoAddress
    );
  };

  return (
    <>
      <div className="p-7"></div>
      <div className="flex justify-center text-24px text-blue-200">
        <label>Member Information 4 Adding...</label>
      </div>
      <form className="" onSubmit={_onSubmit}>
        <div className="p-2 flex justify-center">
          <table>
            <tr>
              <th>
                <label className=" text-white">Name:</label>
              </th>
              <td>
                <input
                  className="m-5 appearance-none border-2 border-gray-200 rounded  py-2 px-4 text-gray-700 
                        leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                  name="name"
                  type="text"
                  onChange={onChangeInput}
                ></input>
              </td>
            </tr>
            <tr>
              <th>
                <label className=" text-white">EOA Address:</label>
              </th>
              <td>
                <input
                  className="m-5 appearance-none border-2 border-gray-200 rounded  py-2 px-4 text-gray-700 
                        leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                  name="memberAddress"
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

        <div className="flex justify-center">
          <button
            className="m-2 px-4 py-2  border-black border-2 bg-blue-200 rounded text-black  hover:bg-green-200"
            onClick={() => _onSubmit}
          >
            Submit
          </button>
        </div>
      </form>
    </>
  );
};

export default AddMember;
