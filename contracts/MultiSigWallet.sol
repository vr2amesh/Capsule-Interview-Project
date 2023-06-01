// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract MultiSigWallet {

    event Deposit(address indexed sender, uint amount, uint balance);
    event SubmitTransaction(
        address indexed sender,
        uint indexed txIndex,
        address indexed target,
        uint value,
        bytes data,
        uint numConfirmationsRequired
    );
    event ConfirmTransaction(address indexed sender, uint indexed txIndex);
    event ExecuteTransaction(address indexed sender, uint indexed txIndex);
    event OwnerAddition(address indexed newOwner);
    event OwnerRemoval(address indexed removedOwner);

    address[] public owners;
    mapping(address => bool) public isOwner;
    mapping(address => bool) public isBlocked;

    struct Transaction {
        address target;
        uint value;
        bytes data;
        bool executed;
        uint numConfirmations;
        uint numConfirmationsRequired;
    }

    mapping(uint => mapping(address => bool)) public isConfirmed;
    Transaction[] public transactions;

    constructor(address[] memory _owners) public {
        require(_owners.length > 0, "owners required");

        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(!isOwner[owner], "owner not unique");

            isOwner[owner] = true;
            owners.push(owner);
        } 
    }

    function deposit() payable external {
        require(!isBlocked[msg.sender], "Blocked sender cannot deposit");
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    function submitTransaction(
        address _target,
        uint _value,
        bytes calldata _data,
        uint _numConfirmationsRequired
    )
        external
        onlyOwner
    {
        require(_numConfirmationsRequired <= owners.length, "Required confirmations exceeds number of owners");
        require(_numConfirmationsRequired > 0, "At least one confirmation required");

        uint txIndex = transactions.length;

        transactions.push(Transaction({
            target: _target,
            value: _value,
            data: _data,
            executed: false,
            numConfirmations: 0,
            numConfirmationsRequired: _numConfirmationsRequired
        }));

        emit SubmitTransaction(msg.sender, txIndex, _target, _value, _data, _numConfirmationsRequired);
    }

    function confirmTransaction(uint _txIndex) public onlyOwner {
        require(_txIndex < transactions.length, "transaction does not exist");

        Transaction storage transaction = transactions[_txIndex];

        require(!isConfirmed[_txIndex][msg.sender], "transaction already confirmed");
        require(!transaction.executed, "transaction already executed");

        isConfirmed[_txIndex][msg.sender] = true;
        transaction.numConfirmations += 1;

        emit ConfirmTransaction(msg.sender, _txIndex);
    }

    function executeTransaction(uint _txIndex) public onlyOwner {
        require(_txIndex < transactions.length, "transaction does not exist");

        Transaction storage transaction = transactions[_txIndex];

        require(transaction.numConfirmations >= transaction.numConfirmationsRequired, "can not execute this transaction yet");
        require(!transaction.executed, "transaction already executed");

        transaction.executed = true;

        (bool success, ) = transaction.target.call.value(transaction.value)(transaction.data);
        require(success, "transaction failed");

        emit ExecuteTransaction(msg.sender, _txIndex);
    }

    function addOwner(address _owner) external onlyOwner {
        require(!isOwner[_owner], "owner exists");
        require(!isBlocked[_owner], "blocked owner cannot be added");

        isOwner[_owner] = true;
        owners.push(_owner);

        emit OwnerAddition(_owner);
    }

    function removeOwner(address _owner) external onlyOwner {
        require(isOwner[_owner], "not an owner");
        require(_owner != msg.sender, "owner cannot remove self");

        isOwner[_owner] = false;

        for (uint i = 0; i < owners.length - 1; i++) {
            if (owners[i] == _owner) {
                owners[i] = owners[owners.length - 1];
                break;
            }
        }
        owners.pop();

        emit OwnerRemoval(_owner);
    }

    function blockAddress(address _address) external onlyOwner {
        require(!isBlocked[_address], "address already blocked");

        isBlocked[_address] = true;
    }

    function unblockAddress(address _address) external onlyOwner {
        require(isBlocked[_address], "address is not blocked");

        isBlocked[_address] = false;
    }

    modifier onlyOwner() {
        require(isOwner[msg.sender], "not an owner");
        _;
    }
}
