import { useState, useContext } from "react";
import { get_account_info, get_selected_address } from "../contracts/get_account_info_api";
import { Proposal4ResetElectionComission } from "../contracts/membermanager_api";
import { PropsalData4ElectionComission } from "../types/MemberManagerType";
import {AppContext} from "../../pages/_app";

interface SelectElectionComissionParameter {
  daoAddress: string;
}

const SelectElectionComission = (props: SelectElectionComissionParameter) => {

  const [electionComissionValue, setElectionComissionValue] =
    useState<PropsalData4ElectionComission>({
      candidateEoa_one: "",
      candidateEoa_two: "",
      title:"",
      outline:"",
      detail:"",
      githubURL:"",
      proposalKind:2,
    });
  const [showSecondCandidate, setShowSecondCandidate] = useState(false);
  const {api} = useContext(AppContext);

  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setElectionComissionValue({
      ...electionComissionValue,
      [event.target.name]: event.target.value,
    });
  };

  const onChangeText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setElectionComissionValue({
      ...electionComissionValue,
      [event.target.name]: event.target.value,
    });
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    console.log("## electionComissionValue", electionComissionValue);
    event.preventDefault();
    const selectedAccount = await get_account_info(get_selected_address());
    await Proposal4ResetElectionComission(
      api,
      selectedAccount,
      electionComissionValue,
      props.daoAddress
    );
  };

  return (
    <>
      <div className="p-7"></div>
      <div className="flex justify-center text-25px text-blue-200">
        <label>
          Enter at least one Election Commission.
        </label>
      </div>
      <form className="" onSubmit={onSubmit}>
        <div className="p-3"></div>
        <div className="flex justify-center text-white">
          <label>[First Election Commission]</label>
        </div>
        <div className="flex justify-center">
          <table>
            <tr>
              <th>
                <label className="text-18px text-white">EOA Address:</label>
              </th>
              <td>
                <input
                  className="m-5 appearance-none border-2 border-gray-200 rounded  py-2 px-4 text-gray-700 
                            leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                  name="candidateEoa_one"
                  type="text"
                  onChange={onChangeInput}
                ></input>
              </td>
            </tr>
          </table>
        </div>
        <div>
          <div className="flex justify-center">
            <label
              className="m-2 px-4 py-2  border-black border-2 bg-blue-200 rounded text-black  hover:bg-green-200"
              onClick={() => setShowSecondCandidate(!showSecondCandidate)}
            >
              +
            </label>
          </div>
          {showSecondCandidate == true && (
            <>
              <div className="p-3"></div>
              <div className="flex justify-center text-red-200">
                <label>[Second Election Commission]</label>
              </div>
              <div className="flex justify-center">
                <table>
                  <tr>
                    <th>
                      <label className="text-18px text-white">
                        EOA Address:
                      </label>
                    </th>
                    <td>
                      <input
                        className="m-5 appearance-none border-2 border-gray-200 rounded  py-2 px-4 text-gray-700 
                            leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                        name="candidateEoa_two"
                        type="text"
                        onChange={onChangeInput}
                      ></input>
                    </td>
                  </tr>
                </table>
              </div>
            </>
          )}
        </div>
        <div className="m-20"></div>
        <div className="m-5 flex justify-center text-30px text-blue-200">
          <label>Proposal Information</label>
        </div>
        <div className="flex flex-col">
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
            Submit
          </button>
        </div>
      </form>
    </>
  );
};

export default SelectElectionComission;
