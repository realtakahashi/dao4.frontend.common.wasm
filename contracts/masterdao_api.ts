import { errorFunction } from "./commonFunctions";
import { SubDAODeployFormData } from "../types/SubDaoType";
import MasterDAOContractConstruct from "../contracts/construct/MasterDAO";
import Web3 from "web3";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";

export const registerSubDAO = async (
  subDAOContractAddess: string,
  inputData: SubDAODeployFormData,
  masterDAOContractAddress: string,
  setFinished:(value:boolean) => void
) => {
  console.log("### subDAOContractAddess:", subDAOContractAddess);
  console.log("### SubDAODeployFormData:", inputData);
  console.log("### masterDAOContractAddress:", masterDAOContractAddress);
  const contractConstract = MasterDAOContractConstruct;
  if (typeof window.ethereum !== "undefined" && masterDAOContractAddress) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      masterDAOContractAddress,
      contractConstract.abi,
      signer
    );
    const tx = await contract
      .registerDAO(
        subDAOContractAddess,
        inputData.name,
        inputData.githubUrl,
        inputData.description
      )
      .catch((err: any) => {
        errorFunction(err);
        return;
      });

      const ret = await tx.wait();
      setFinished(true);
  }
  return;
};

export const doDonateMasterDao = async (amount:number) => {
  console.log("## Mater Dao Donate;");
  const masterDAOAddress = process.env.NEXT_PUBLIC_MASTERDAO_CONTRACT_ADDRESS;
  const contractConstract = MasterDAOContractConstruct;
  if (typeof window.ethereum !== "undefined" && masterDAOAddress) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      masterDAOAddress,
      contractConstract.abi,
      signer
    );
    await contract
      .donate({value:ethers.utils.parseEther(String(amount))})
      .catch((err: any) => {
        console.log(err);
        errorFunction(err);
      });
  }
};

export const getMasterDaoBalance = async (): Promise<number> => {
  const masterDAOAddress = process.env.NEXT_PUBLIC_MASTERDAO_CONTRACT_ADDRESS;
  const contractConstract = MasterDAOContractConstruct;
  let response: number = 0;
  if (typeof window.ethereum !== "undefined" && masterDAOAddress) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      masterDAOAddress,
      contractConstract.abi,
      signer
    );
    response = await contract.getContractBalance().catch((err: any) => {
      console.log(err);
      errorFunction(err);
    });
    console.log("### getProposalList Return: ", response);
  }
  return response;
};
