import { useState, useContext } from "react";
import {
  get_account_info,
  get_selected_address,
} from "../contracts/get_account_info_api";
import { propose4DeletingTheMember } from "../contracts/membermanager_api";
import { MemberInfo } from "../types/MemberManagerType";
import { AddProposalData } from "../types/ProposalManagerType";
import {AppContext} from "../../pages/_app";

interface DeleteMemberParameter {
  daoAddress: string;
  memberInfo: MemberInfo;
}

const DeleteMember = (props: DeleteMemberParameter) => {
  const [proposalValue, setProposalValue] = useState<AddProposalData>({
    proposalKind: 1,
    title: "",
    outline: "",
    githubURL: "",
    detail: "",
  });
  const {api} = useContext(AppContext);

  const deleteMember = async () => {
    const selectedAccount = await get_account_info(get_selected_address());
    await propose4DeletingTheMember(
      api,
      selectedAccount,
      props.memberInfo,
      proposalValue,
      props.daoAddress
    );
  };

  const onChangeText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProposalValue({
      ...proposalValue,
      [event.target.name]: event.target.value,
    });
  };

  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProposalValue({
      ...proposalValue,
      [event.target.name]: event.target.value,
    });
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    console.log("## _onSubmit 1");
    event.preventDefault();
    await deleteMember();
  };

  return (
    <>
      <div className="p-2"></div>
      <div className="flex justify-center text-24px text-blue-200">
        <label>Member Information 4 Deleting...</label>
      </div>
      <div className="p-2 flex justify-center">
        <table>
          <tr className="">
            <th className="px-2 py-4 text-white flex justify-end ">
              Name:
            </th>
            <td className="px-2 py-4 text-white ">
              {props.memberInfo.name}
            </td>
          </tr>
          <tr className="">
            <th className="px-2 py-4 text-white flex justify-end ">
              Member Id:
            </th>
            <td className="px-2 py-4 text-white ">
              {String(props.memberInfo.memberId)}
            </td>
          </tr>
          <tr className="">
            <th className="px-2 py-4  text-white flex justify-end ">
              Address:
            </th>
            <td className="px-2 py-4 text-14px text-white ">
              {props.memberInfo.eoaAddress}
            </td>
          </tr>
        </table>
      </div>
      <div className="m-5"></div>
      <div className="flex justify-center  m-3 text-30px text-blue-200">
            <label>Proposal Information</label>
          </div>
      <form className="" onSubmit={onSubmit}>
        <div className="p-2 flex flex-col">
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
            onClick={() => onSubmit}
          >
            Create The Proposal
          </button>
        </div>
      </form>
    </>
  );
};

export default DeleteMember;
