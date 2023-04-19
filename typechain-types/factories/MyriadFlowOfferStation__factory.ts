/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  Overrides,
  BigNumberish,
} from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  MyriadFlowOfferStation,
  MyriadFlowOfferStationInterface,
} from "../MyriadFlowOfferStation";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint96",
        name: "_platformFee",
        type: "uint96",
      },
      {
        internalType: "string",
        name: "_version",
        type: "string",
      },
      {
        internalType: "bool",
        name: "_paused",
        type: "bool",
      },
      {
        internalType: "address",
        name: "flowContract",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "contractAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "offerId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "seller",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "finalAmount",
        type: "uint256",
      },
    ],
    name: "ProposalAccepted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "nftContractAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "offerId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "metadataURI",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "proposedAmmount",
        type: "uint256",
      },
    ],
    name: "ProposalInitiated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "offerId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "previousAmount",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "updatedAmount",
        type: "uint256",
      },
    ],
    name: "ProposalUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "offerId",
        type: "uint256",
      },
    ],
    name: "ProposalWithdrawn",
    type: "event",
  },
  {
    inputs: [],
    name: "MyriadFlowOfferStationPayoutAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_offerId",
        type: "uint256",
      },
    ],
    name: "acceptOffer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_nftContractAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
    ],
    name: "createOffer",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "idToproposal",
    outputs: [
      {
        internalType: "address",
        name: "nftContractAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "proposedBid",
        type: "uint256",
      },
      {
        internalType: "enum MyriadFlowOfferStation.ProposalStatus",
        name: "status",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "offerId",
        type: "uint256",
      },
    ],
    name: "increaseOffer",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "platformFeeBasisPoint",
    outputs: [
      {
        internalType: "uint96",
        name: "",
        type: "uint96",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "proposalCounter",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_salePrice",
        type: "uint256",
      },
    ],
    name: "royaltyInfo",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "setPause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "offerId",
        type: "uint256",
      },
    ],
    name: "withdrawOffer",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405260006005553480156200001657600080fd5b50604051620016873803806200168783398101604081905262000039916200010e565b6001600055600880546001600160a01b0319166001600160a01b038381169190911790915560068054909116600160a01b6001600160601b03871602179055620000803390565b600680546001600160a01b0319166001600160a01b03929092169190911790556004620000ae8482620002b8565b50506003805460ff191691151591909117905550620003849050565b634e487b7160e01b600052604160045260246000fd5b80518015158114620000f157600080fd5b919050565b80516001600160a01b0381168114620000f157600080fd5b600080600080608085870312156200012557600080fd5b84516001600160601b03811681146200013d57600080fd5b602086810151919550906001600160401b03808211156200015d57600080fd5b818801915088601f8301126200017257600080fd5b815181811115620001875762000187620000ca565b604051601f8201601f19908116603f01168101908382118183101715620001b257620001b2620000ca565b816040528281528b86848701011115620001cb57600080fd5b600093505b82841015620001ef5784840186015181850187015292850192620001d0565b60008684830101528098505050505050506200020e60408601620000e0565b91506200021e60608601620000f6565b905092959194509250565b600181811c908216806200023e57607f821691505b6020821081036200025f57634e487b7160e01b600052602260045260246000fd5b50919050565b601f821115620002b357600081815260208120601f850160051c810160208610156200028e5750805b601f850160051c820191505b81811015620002af578281556001016200029a565b5050505b505050565b81516001600160401b03811115620002d457620002d4620000ca565b620002ec81620002e5845462000229565b8462000265565b602080601f8311600181146200032457600084156200030b5750858301515b600019600386901b1c1916600185901b178555620002af565b600085815260208120601f198616915b82811015620003555788860151825594840194600190910190840162000334565b5085821015620003745787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b6112f380620003946000396000f3fe6080604052600436106100c25760003560e01c80635a9cd0331161007f5780638610f045116100595780638610f0451461023a578063c815729d1461025a578063d431b1ac1461027a578063d98352911461028f57600080fd5b80635a9cd033146101ce5780635c975abb1461020d578063746538d91461022757600080fd5b806301ffc9a7146100c75780630574ca29146100fc5780630c0512e9146101345780632a17f4bb146101585780632a55205a1461016d57806354fd4d50146101ac575b600080fd5b3480156100d357600080fd5b506100e76100e2366004610e04565b6102f9565b60405190151581526020015b60405180910390f35b34801561010857600080fd5b5060065461011c906001600160a01b031681565b6040516001600160a01b0390911681526020016100f3565b34801561014057600080fd5b5061014a60055481565b6040519081526020016100f3565b61016b610166366004610e35565b61030a565b005b34801561017957600080fd5b5061018d610188366004610e4e565b610477565b604080516001600160a01b0390931683526020830191909152016100f3565b3480156101b857600080fd5b506101c1610523565b6040516100f39190610ec0565b3480156101da57600080fd5b506006546101f590600160a01b90046001600160601b031681565b6040516001600160601b0390911681526020016100f3565b34801561021957600080fd5b506003546100e79060ff1681565b61014a610235366004610ee8565b6105b1565b34801561024657600080fd5b5061014a610255366004610e35565b610789565b34801561026657600080fd5b5061016b610275366004610e35565b6108c3565b34801561028657600080fd5b5061016b610c74565b34801561029b57600080fd5b506102e86102aa366004610e35565b600760205260009081526040902080546001820154600283015460038401546004909401546001600160a01b03938416949293909116919060ff1685565b6040516100f3959493929190610f2a565b600061030482610d76565b92915050565b80600160008281526007602052604090206004015460ff16600381111561033357610333610f14565b146103595760405162461bcd60e51b815260040161035090610f7e565b60405180910390fd5b60008281526007602052604090206002015482906001600160a01b031633146103945760405162461bcd60e51b815260040161035090610fd0565b60035460ff16156103b75760405162461bcd60e51b81526004016103509061102d565b600034116104175760405162461bcd60e51b815260206004820152602760248201527f4d7972696164466c6f774f6666657253746174696f6e3a2043616e27742062656044820152660102d32b93790960cd1b6064820152608401610350565b60008381526007602052604090206003015461043334826110aa565b60008581526007602052604080822060030183905551839187917fb37d56408bbd568656f3b1432db39f663e302ad350a685c04f225020b75dd5419190a450505050565b60008281526002602090815260408083208151808301909252546001600160a01b038116808352600160a01b9091046001600160601b03169282019290925282916104ec5750604080518082019091526001546001600160a01b0381168252600160a01b90046001600160601b031660208201525b60208101516000906127109061050b906001600160601b0316876110bd565b61051591906110d4565b915196919550909350505050565b60048054610530906110f6565b80601f016020809104026020016040519081016040528092919081815260200182805461055c906110f6565b80156105a95780601f1061057e576101008083540402835291602001916105a9565b820191906000526020600020905b81548152906001019060200180831161058c57829003601f168201915b505050505081565b60035460009060ff16156105d75760405162461bcd60e51b81526004016103509061102d565b600580549060006105e783611130565b91905055506040518060a00160405280846001600160a01b031681526020018381526020016106133390565b6001600160a01b0316815234602082015260400160019052600554600090815260076020908152604091829020835181546001600160a01b03199081166001600160a01b0392831617835592850151600180840191909155938501516002830180549094169116179091556060830151600380830191909155608084015160048301805493949193909260ff19909116919084908111156106b6576106b6610f14565b02179055505060405163c87b56dd60e01b815260048101849052600091506001600160a01b0385169063c87b56dd90602401600060405180830381865afa158015610705573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261072d919081019061115f565b90503483856001600160a01b03167f54dac5242a0f595e5b3294ddd2e7f34f99167961169fe0bb2e04fcd04cbeada1600554856107673390565b6040516107769392919061120c565b60405180910390a4505060055492915050565b6000610793610dab565b81600160008281526007602052604090206004015460ff1660038111156107bc576107bc610f14565b146107d95760405162461bcd60e51b815260040161035090610f7e565b60008381526007602052604090206002015483906001600160a01b031633146108145760405162461bcd60e51b815260040161035090610fd0565b60035460ff16156108375760405162461bcd60e51b81526004016103509061102d565b600084815260076020526040808220600301549051339282156108fc02929190818181858888f19350505050158015610874573d6000803e3d6000fd5b50600084815260076020526040808220600401805460ff191660021790555185917f5ca6c0bba519c857c8713fba9f5f1b582abe00c95dcccedccea41ad683bad26d91a2505060016000555090565b6108cb610dab565b80600160008281526007602052604090206004015460ff1660038111156108f4576108f4610f14565b146109115760405162461bcd60e51b815260040161035090610f7e565b6000828152600760205260409020805460018201546002909201546001600160a01b03918216929116336040516331a9108f60e11b8152600481018490526001600160a01b0391821691851690636352211e90602401602060405180830381865afa158015610984573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109a8919061123d565b6001600160a01b031614610a185760405162461bcd60e51b815260206004820152603160248201527f4d7972696164466c6f774f6666657253746174696f6e3a2043616c6c6572206960448201527073206e6f7420746865206f776e6572202160781b6064820152608401610350565b6001600160a01b0383166323b872dd336040516001600160e01b031960e084901b1681526001600160a01b039182166004820152908416602482015260448101859052606401600060405180830381600087803b158015610a7857600080fd5b505af1158015610a8c573d6000803e3d6000fd5b5050506000868152600760205260408120600301546006549092506103e890610ac590600160a01b90046001600160601b0316846110bd565b610acf91906110d4565b90506000610add828461125a565b60405163152a902d60e11b8152600481018790526024810182905290915060009081906001600160a01b03891690632a55205a906044016040805180830381865afa158015610b30573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b54919061126d565b90925090506000610b65828561125a565b6006546040519192506001600160a01b03169086156108fc029087906000818181858888f19350505050158015610ba0573d6000803e3d6000fd5b506040516001600160a01b0384169083156108fc029084906000818181858888f19350505050158015610bd7573d6000803e3d6000fd5b50604051339082156108fc029083906000818181858888f19350505050158015610c05573d6000803e3d6000fd5b508a886001600160a01b038b167f64c9e7665b2fc264027f3550925eaab82f4aec88eb68a013708c83772cf7743e33604080516001600160a01b039283168152918d16602083015281018b905260600160405180910390a450505050505050505050610c716001600055565b50565b6008546001600160a01b03166324d7806c336040516001600160e01b031960e084901b1681526001600160a01b039091166004820152602401602060405180830381865afa158015610cca573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610cee919061129b565b610d515760405162461bcd60e51b815260206004820152602e60248201527f4d7972696164466c6f774f6666657253746174696f6e3a20557365722069732060448201526d1b9bdd08185d5d1a1bdc9a5e995960921b6064820152608401610350565b60035460ff16610d6a576003805460ff19166001179055565b6003805460ff19169055565b60006001600160e01b0319821663152a902d60e11b148061030457506301ffc9a760e01b6001600160e01b0319831614610304565b600260005403610dfd5760405162461bcd60e51b815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c006044820152606401610350565b6002600055565b600060208284031215610e1657600080fd5b81356001600160e01b031981168114610e2e57600080fd5b9392505050565b600060208284031215610e4757600080fd5b5035919050565b60008060408385031215610e6157600080fd5b50508035926020909101359150565b60005b83811015610e8b578181015183820152602001610e73565b50506000910152565b60008151808452610eac816020860160208601610e70565b601f01601f19169290920160200192915050565b602081526000610e2e6020830184610e94565b6001600160a01b0381168114610c7157600080fd5b60008060408385031215610efb57600080fd5b8235610f0681610ed3565b946020939093013593505050565b634e487b7160e01b600052602160045260246000fd5b6001600160a01b03868116825260208201869052841660408201526060810183905260a0810160048310610f6e57634e487b7160e01b600052602160045260246000fd5b8260808301529695505050505050565b60208082526032908201527f4d7972696164466c6f774f6666657253746174696f6e3a2050726f706f73616c604082015271081a5cc8185b1c9958591e4810db1bdcd95960721b606082015260800190565b60208082526038908201527f4d7972696164466c6f774f6666657253746174696f6e3a20557365722064696460408201527f206e6f7420696e74696174656420746865206f66666572210000000000000000606082015260800190565b60208082526041908201527f4d79726961644f6666657253746174696f6e3a20596f752063616e6e6f74206f60408201527f66666572202c2069742069732070617573656420666f7220736f6d6574696d656060820152602160f81b608082015260a00190565b634e487b7160e01b600052601160045260246000fd5b8082018082111561030457610304611094565b808202811582820484141761030457610304611094565b6000826110f157634e487b7160e01b600052601260045260246000fd5b500490565b600181811c9082168061110a57607f821691505b60208210810361112a57634e487b7160e01b600052602260045260246000fd5b50919050565b60006001820161114257611142611094565b5060010190565b634e487b7160e01b600052604160045260246000fd5b60006020828403121561117157600080fd5b815167ffffffffffffffff8082111561118957600080fd5b818401915084601f83011261119d57600080fd5b8151818111156111af576111af611149565b604051601f8201601f19908116603f011681019083821181831017156111d7576111d7611149565b816040528281528760208487010111156111f057600080fd5b611201836020830160208801610e70565b979650505050505050565b8381526060602082015260006112256060830185610e94565b905060018060a01b0383166040830152949350505050565b60006020828403121561124f57600080fd5b8151610e2e81610ed3565b8181038181111561030457610304611094565b6000806040838503121561128057600080fd5b825161128b81610ed3565b6020939093015192949293505050565b6000602082840312156112ad57600080fd5b81518015158114610e2e57600080fdfea26469706673582212208ea7d3f91558b59fb1ac2e7c70c805fa326008e0eef8d1f6f37835c79c3284c164736f6c63430008110033";

type MyriadFlowOfferStationConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MyriadFlowOfferStationConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class MyriadFlowOfferStation__factory extends ContractFactory {
  constructor(...args: MyriadFlowOfferStationConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
    this.contractName = "MyriadFlowOfferStation";
  }

  deploy(
    _platformFee: BigNumberish,
    _version: string,
    _paused: boolean,
    flowContract: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<MyriadFlowOfferStation> {
    return super.deploy(
      _platformFee,
      _version,
      _paused,
      flowContract,
      overrides || {}
    ) as Promise<MyriadFlowOfferStation>;
  }
  getDeployTransaction(
    _platformFee: BigNumberish,
    _version: string,
    _paused: boolean,
    flowContract: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _platformFee,
      _version,
      _paused,
      flowContract,
      overrides || {}
    );
  }
  attach(address: string): MyriadFlowOfferStation {
    return super.attach(address) as MyriadFlowOfferStation;
  }
  connect(signer: Signer): MyriadFlowOfferStation__factory {
    return super.connect(signer) as MyriadFlowOfferStation__factory;
  }
  static readonly contractName: "MyriadFlowOfferStation";
  public readonly contractName: "MyriadFlowOfferStation";
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MyriadFlowOfferStationInterface {
    return new utils.Interface(_abi) as MyriadFlowOfferStationInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MyriadFlowOfferStation {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as MyriadFlowOfferStation;
  }
}
