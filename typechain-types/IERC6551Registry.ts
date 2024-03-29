/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import { Listener, Provider } from "@ethersproject/providers";
import { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "./common";

export interface IERC6551RegistryInterface extends utils.Interface {
  contractName: "IERC6551Registry";
  functions: {
    "account(address,uint256,address,uint256,uint256)": FunctionFragment;
    "createAccount(address,uint256,address,uint256,uint256,bytes)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "account",
    values: [string, BigNumberish, string, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "createAccount",
    values: [
      string,
      BigNumberish,
      string,
      BigNumberish,
      BigNumberish,
      BytesLike
    ]
  ): string;

  decodeFunctionResult(functionFragment: "account", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "createAccount",
    data: BytesLike
  ): Result;

  events: {
    "AccountCreated(address,address,uint256,address,uint256,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "AccountCreated"): EventFragment;
}

export type AccountCreatedEvent = TypedEvent<
  [string, string, BigNumber, string, BigNumber, BigNumber],
  {
    account: string;
    implementation: string;
    chainId: BigNumber;
    tokenContract: string;
    tokenId: BigNumber;
    salt: BigNumber;
  }
>;

export type AccountCreatedEventFilter = TypedEventFilter<AccountCreatedEvent>;

export interface IERC6551Registry extends BaseContract {
  contractName: "IERC6551Registry";
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IERC6551RegistryInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    account(
      implementation: string,
      chainId: BigNumberish,
      tokenContract: string,
      tokenId: BigNumberish,
      salt: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string]>;

    createAccount(
      implementation: string,
      chainId: BigNumberish,
      tokenContract: string,
      tokenId: BigNumberish,
      salt: BigNumberish,
      initData: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  account(
    implementation: string,
    chainId: BigNumberish,
    tokenContract: string,
    tokenId: BigNumberish,
    salt: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  createAccount(
    implementation: string,
    chainId: BigNumberish,
    tokenContract: string,
    tokenId: BigNumberish,
    salt: BigNumberish,
    initData: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    account(
      implementation: string,
      chainId: BigNumberish,
      tokenContract: string,
      tokenId: BigNumberish,
      salt: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    createAccount(
      implementation: string,
      chainId: BigNumberish,
      tokenContract: string,
      tokenId: BigNumberish,
      salt: BigNumberish,
      initData: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;
  };

  filters: {
    "AccountCreated(address,address,uint256,address,uint256,uint256)"(
      account?: null,
      implementation?: null,
      chainId?: null,
      tokenContract?: null,
      tokenId?: null,
      salt?: null
    ): AccountCreatedEventFilter;
    AccountCreated(
      account?: null,
      implementation?: null,
      chainId?: null,
      tokenContract?: null,
      tokenId?: null,
      salt?: null
    ): AccountCreatedEventFilter;
  };

  estimateGas: {
    account(
      implementation: string,
      chainId: BigNumberish,
      tokenContract: string,
      tokenId: BigNumberish,
      salt: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    createAccount(
      implementation: string,
      chainId: BigNumberish,
      tokenContract: string,
      tokenId: BigNumberish,
      salt: BigNumberish,
      initData: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    account(
      implementation: string,
      chainId: BigNumberish,
      tokenContract: string,
      tokenId: BigNumberish,
      salt: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    createAccount(
      implementation: string,
      chainId: BigNumberish,
      tokenContract: string,
      tokenId: BigNumberish,
      salt: BigNumberish,
      initData: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
