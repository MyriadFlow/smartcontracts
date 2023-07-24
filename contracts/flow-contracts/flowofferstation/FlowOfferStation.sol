// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "../../accessmaster/interfaces/IAccessMaster.sol";

contract MyriadFlowOfferStation is Context, ReentrancyGuard, ERC2981 {
    bool public paused;
    uint8 public version = 1;

    uint256 public proposalCounter = 0;
    address private flowOfferStationPayoutAddress;
    uint96 public platformFeeBasisPoint;

    enum ProposalStatus {
        NONEXISTANT,
        ACTIVE,
        WITHDRAWN,
        SOLD // Accepted
    }

    struct ProposalId {
        address nftContractAddress;
        uint tokenId;
        address buyer;
        uint proposedBid;
        ProposalStatus status;
    }

    mapping(uint => ProposalId) public idToproposal;

    IACCESSMASTER flowRoles;

    event ProposalInitiated(
        address indexed nftContractAddress,
        uint256 indexed tokenId,
        uint256 offerId,
        string metadataURI,
        address buyer,
        uint256 indexed proposedAmmount
    );
    event ProposalWithdrawn(uint256 indexed offerId);

    event ProposalAccepted(
        address indexed contractAddress,
        uint256 indexed tokenId,
        uint256 indexed offerId,
        address seller,
        address buyer,
        uint256 finalAmount
    );
    event ProposalUpdated(
        uint256 indexed offerId,
        uint256 indexed previousAmount,
        uint256 indexed updatedAmount
    );

    modifier onlyWhenProposalActive(uint offerId) {
        require(
            idToproposal[offerId].status == ProposalStatus.ACTIVE,
            "MyriadFlowOfferStation: Proposal is already Closed"
        );
        _;
    }
    modifier onlyIfOfferCreator(uint offerId) {
        require(
            idToproposal[offerId].buyer == _msgSender(),
            "MyriadFlowOfferStation: User did not intiated the offer!"
        );
        _;
    }

    modifier onlyWhenNotPaused() {
        require(
            paused == false,
            "MyriadOfferStation: You cannot offer , it is paused for sometime!"
        );
        _;
    }

    modifier onlyOperator() {
        require(
            flowRoles.isOperator(_msgSender()),
            "EternalSoul: User is not authorized "
        );
        _;
    }

    constructor(
        uint96 _platformFee,
        bool _paused,
        address flowContract
    ) {
        flowRoles = IACCESSMASTER(flowContract);

        platformFeeBasisPoint = _platformFee;
        flowOfferStationPayoutAddress = _msgSender();
        paused = _paused;
    }

    function updatePlatformFee(uint96 _platformFee) external onlyOperator {
        platformFeeBasisPoint = _platformFee;
    }

    /// @notice create an Offer to any  nft contract in the blockchain
    function createOffer(
        address _nftContractAddress,
        uint _tokenId
    ) external payable onlyWhenNotPaused returns (uint) {
        proposalCounter++;
        idToproposal[proposalCounter] = ProposalId(
            _nftContractAddress,
            _tokenId,
            _msgSender(),
            msg.value,
            ProposalStatus.ACTIVE
        );

        string memory metadataURI = IERC721Metadata(_nftContractAddress)
            .tokenURI(_tokenId);

        emit ProposalInitiated(
            _nftContractAddress,
            _tokenId,
            proposalCounter,
            metadataURI,
            _msgSender(),
            msg.value
        );
        return proposalCounter;
    }

    /// @notice Withdraw the offer if the User does not intend anymore
    function withdrawOffer(
        uint256 offerId
    )
        external
        nonReentrant
        onlyWhenProposalActive(offerId)
        onlyIfOfferCreator(offerId) //onlyIfOfferCreator
        onlyWhenNotPaused
        returns (uint)
    {
        payable(msg.sender).transfer(idToproposal[offerId].proposedBid);

        idToproposal[offerId].status = ProposalStatus.WITHDRAWN;

        emit ProposalWithdrawn(offerId);

        return offerId;
    }

    /// @notice Token Owner accepts the Offer and transfers the token to the buyer
    function acceptOffer(
        uint _offerId
    ) external nonReentrant onlyWhenProposalActive(_offerId) {
        address contractAddress = idToproposal[_offerId].nftContractAddress;
        uint tokenId = idToproposal[_offerId].tokenId;
        address buyer = idToproposal[_offerId].buyer;

        require(
            IERC721(contractAddress).ownerOf(tokenId) == _msgSender(),
            "MyriadFlowOfferStation: Caller is not the owner !"
        );

        IERC721(contractAddress).transferFrom(_msgSender(), buyer, tokenId);

        uint value = idToproposal[_offerId].proposedBid;

        uint256 payoutForMyriadFlowOfferStation = (value *
            platformFeeBasisPoint) / 1000;

        uint256 amountToOwner = value - payoutForMyriadFlowOfferStation;

        //Calculate Royalty Amount for Creator
        (address creator, uint256 royaltyAmount) = IERC2981(contractAddress)
            .royaltyInfo(tokenId, amountToOwner);

        // Calculate Payout for Seller
        uint256 payoutForSeller = amountToOwner - royaltyAmount;

        //transfering amounts to MyriadFlowOfferStation, creator and seller
        payable(flowOfferStationPayoutAddress).transfer(
            payoutForMyriadFlowOfferStation
        );
        //payout for creator
        payable(creator).transfer(royaltyAmount);
        //item Seller
        payable(_msgSender()).transfer(payoutForSeller);

        emit ProposalAccepted(
            contractAddress,
            tokenId,
            _offerId,
            _msgSender(),
            buyer,
            value
        );
    }

    /// @notice To increase the Offer Price of a Offer Id

    function increaseOffer(
        uint256 offerId
    )
        external
        payable
        onlyWhenProposalActive(offerId)
        onlyIfOfferCreator(offerId)
        onlyWhenNotPaused
    {
        require(msg.value > 0, "MyriadFlowOfferStation: Can't be Zero! ");
        uint previousAmount = idToproposal[offerId].proposedBid;

        idToproposal[offerId].proposedBid = previousAmount + msg.value;

        emit ProposalUpdated(
            offerId,
            previousAmount,
            idToproposal[offerId].proposedBid
        );
    }

    function setPause() external onlyOperator {
        paused ? paused = false : paused = true;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
