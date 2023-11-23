import { artifacts, ethers, network } from "hardhat";
import { LSPFactory } from '@lukso/lsp-factory.js';
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

export type UniversalProfileData = {
  eoa: HardhatEthersSigner,
  address: string,
  universalReceiverDelegateAddress: string,
  keyManagerAddress: string
}

export async function createUP(name = 'Tesnet Universal Profile',
  description = "Testnet Universal Profile for https://app.buidlbox.io/lukso/build-up-2",
  tags = ["tesnet", "demo", "buildapp", "buildup#2", "buidlbox.io"],
  links = [
    {
      title: "builup#2",
      url: "https://app.buidlbox.io/lukso/build-up-2"
    },
    {
      title: "web site",
      url: "https://iteasys.com/"
    }
  ]
): Promise<UniversalProfileData> {
  // from hardhat localnet default values 
  const url = "http://127.0.0.1:8545/"
  const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
  const [myEOA] = await ethers.getSigners()

  const lspFactory = new LSPFactory(url, {
    deployKey: privateKey, // Private key of the account which will deploy smart contracts
    chainId: network.config.chainId,
  });

  const deployedContracts = await lspFactory.UniversalProfile.deploy({
    controllerAddresses: [myEOA.address], // our EOA that will be controlling the UP
    lsp3Profile: {
      name: name,
      description: description,
      tags: tags,
      links: links,
    },
  });

  // console.log(deployedContracts);

  const UP: UniversalProfileData = {
    eoa: myEOA,
    address: deployedContracts.LSP0ERC725Account.address,
    keyManagerAddress: deployedContracts.LSP6KeyManager.address,
    universalReceiverDelegateAddress: deployedContracts.LSP1UniversalReceiverDelegate.address
  }

  return UP;
}

export async function deployContractAsUp(up: UniversalProfileData, contractName: string, args: any[]) {
  const UP = await ethers.getContractAt('UniversalProfile', up.address);
  // console.log('🔑 EOA: ', up.eoa.address);
  // console.log('🆙 Universal Profile: ', await UP.getAddress());

  // console.log(`⏳ Deploying the contract ${contractName}`);
  const contract = await ethers.getContractFactory(contractName)
  const contract_artifacts = artifacts.readArtifactSync(contractName)
  const ContractBytecode = contract_artifacts.bytecode;
  const coder = ethers.AbiCoder.defaultAbiCoder()
  const inputs = contract.interface.deploy.inputs
  const data = coder.encode(inputs, args);


  const value = ContractBytecode + data.slice(2)
  const ContractAddress = await UP.connect(up.eoa)
    .getFunction('execute')
    .staticCall(1, ethers.ZeroAddress, 0, value);

  // console.log(`deploy => address should be ${ContractAddress}`)

  // deploy CustomLSP7 as the UP (signed by the browser extension controller)
  const txn = await UP.connect(up.eoa).execute(
    1,
    ethers.ZeroAddress,
    0,
    value,
  );

  await txn.wait();
  // console.log(
  //   `✅ Contract [${contractName}] successfully deployed at address: [${ContractAddress}]`
  // );
  return ContractAddress
}


export async function executeAsUp(up: UniversalProfileData, contractName: string,
  contractAddress: string,
  contractFunction: string,
  args: any[]) {
  const UP = await ethers.getContractAt('UniversalProfile', up.address);
  // console.log('🔑 EOA: ', up.eoa.address);
  // console.log('🆙 Universal Profile: ', await UP.getAddress());

  // const contract = await ethers.getContractFactory(contractName)
  const contract_artifacts = artifacts.readArtifactSync(contractName)

  const CustomTokenAbi =
    contract_artifacts.abi;
  const abiInterface = new ethers.Interface(CustomTokenAbi)
  const callData = abiInterface.encodeFunctionData(contractFunction, args)
  const txn = UP.connect(up.eoa).execute(
    0,
    contractAddress,
    0,
    callData,
  );
  console.log(`🛠️  Executing %${contractFunction}% on ${contractName}[${contractAddress}] from UP[${up.address}]`);
  return txn
}

export async function executeBatchAsUp(up: UniversalProfileData, contractNames: string[],
  contractAddresses: string[],
  contractFunctions: string[],
  args: any[][]) {
  asserts(contractAddresses.length == contractFunctions.length, "Mismatches addr and functions length")
  asserts(contractAddresses.length == args.length, "Mismatches args length")

  const UP = await ethers.getContractAt('UniversalProfile', up.address);
  // console.log('🔑 EOA: ', up.eoa.address);
  // console.log('🆙 Universal Profile: ', await UP.getAddress());

  // const contract = await ethers.getContractFactory(contractName)
  const callDatas = new Array<string>(contractFunctions.length).fill("");
  for (let i = 0; i < contractFunctions.length; i++) {
    const contract_artifacts = artifacts.readArtifactSync(contractNames[i])
    const CustomTokenAbi =
      contract_artifacts.abi;
    const abiInterface = new ethers.Interface(CustomTokenAbi)
    const callData = abiInterface.encodeFunctionData(contractFunctions[i], args[i])
    callDatas[i] = callData
  }
  const operations = new Array<number>(contractFunctions.length).fill(0);
  const values = new Array<number>(contractFunctions.length).fill(0);
  //const addrs = new Array<string>(contractFunctions.length).fill(contractAddress);
  const txn = UP.connect(up.eoa).executeBatch(
    operations,
    contractAddresses,
    values,
    callDatas,
  );
  for (let index = 0; index < contractFunctions.length; index++) {
    console.log(`🛠️  Executing %${contractFunctions[index]}% on ${contractNames[index]}[${contractAddresses[index]}] from UP[${up.address}]`);
  }
  return txn
}

export function keccak256(val: string): string {
  const enc = new TextEncoder()
  return ethers.keccak256(enc.encode(val))
}

export function decodeAbiMetaData(abiStr: string) {
  console.log(abiStr)
  const coder = ethers.AbiCoder.defaultAbiCoder()
  const returnedData = coder.decode(["string",], abiStr)
  console.log(returnedData)
  return returnedData
}

export function LSP2MappingBytes32(nameKey: string, val: string): string {
  // see https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md#mapping
  const hashKeyName = keccak256(nameKey).slice(0, 2 + 10 * 2) + "0000"
  const mapping = hashKeyName + val.slice(2, 20 * 2 + 2)
  return mapping
}


function asserts(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg);
  }
}