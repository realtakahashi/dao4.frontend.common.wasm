import { useState } from "react";
import { useEffect } from "react";
import Link from "next/link";
import { MemberInfo, MemberInfoPlus } from "../types/MemberManagerType";
import { getMemberList } from "../contracts/membermanager_api";
import DeleteMember from "./DeleteMember";
import { get_selected_address } from "../contracts/get_account_info_api";

interface ShowListSetting {
  setShowMemberButton: (flg: boolean) => void;
  setShowElectionButton: (flg: boolean) => void;
  daoAddress:string;
}

const MemberList = (props: ShowListSetting) => {
  const [memberList, setMemberList] = useState<Array<MemberInfoPlus>>();
  const [showDelete, setShowDelete] = useState(false);
  const [showList, setShowList] = useState(true);
  const [showListButton, setShowListButton] = useState(false);
  const [selectMember, setSelectMember] = useState<MemberInfo>({
    name: "",
    memberId: 0,
    eoaAddress: "",
    tokenId: 0,
  });

  useEffect(() => {
    const _getMemberList = async () => {
      const selectedAddress = get_selected_address();
      const result = await getMemberList(selectedAddress,props.daoAddress);
      console.log("## memberList:",result);
      setMemberList(result);
    };

    _getMemberList();
  }, []);

  const setDeleteShowAndMemberInfo = (
    _showDelete: boolean,
    _showList: boolean,
    _memberInfo: MemberInfo
  ) => {
    setSelectMember(_memberInfo);
    setDeleteShow(_showDelete, _showList);
  };

  const setDeleteShow = (_showDelete: boolean, _showList: boolean) => {
    setShowListButton(_showDelete);
    setShowDelete(_showDelete);
    setShowList(_showList);
    if (_showDelete) {
      props.setShowElectionButton(false);
      props.setShowMemberButton(false);
    } else {
      props.setShowElectionButton(true);
      props.setShowMemberButton(true);
    }
  };

  return (
    <>
      {showListButton == true && (
        <div className="flex flex-wrap justify-center mx-1 lg:-mx-4">
          <button
            className="m-2 px-4 py-2  border-black border-2 bg-white rounded text-black  hover:bg-green-200"
            onClick={() => setDeleteShow(false, true)}
          >
            Back To List
          </button>
        </div>
      )}
      {showList == true && (
        <div className="p-2 flex flex-wrap justify-center mx-1 lg:-mx-4">
          {typeof memberList !== "undefined"
            ? memberList.map((member) => {
                return (
                  <div key={member.name}>
                  {member.name!="" &&(
                    
                <div
                    className="m-5  max-w-sm rounded overflow-hidden shadow-lg bg-black border-4 border-white">
                    <div className="px-6 py-4">
                      <div className="font-bold mb-2 text-white">
                        Name: {member.name}
                      </div>
                      {member.isElectionCommition == true && (
                        <p className="text-orange-400 font-bold text-14px">
                          Election Comission
                        </p>
                      )}
                      <p className="p-3 text-white text-base">
                        Member Id: {member.memberId}
                      </p>
                      <p className="text-gray-400 text-12px">
                        {member.eoaAddress}
                      </p>
                    </div>
                    <div className="px-6 pb-2">
                      <button
                        className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                        onClick={() =>
                          setDeleteShowAndMemberInfo(true, false, member)
                        }
                      >
                        Delete
                      </button>
                    </div>
                    </div>
                    )};
                  </div>
                );
              })
            : ""}
        </div>
      )}
      ;
      {showDelete == true && (
        <DeleteMember
        memberInfo={selectMember}
        daoAddress={props.daoAddress}
        ></DeleteMember>
      )}
    </>
  );
};

export default MemberList;
