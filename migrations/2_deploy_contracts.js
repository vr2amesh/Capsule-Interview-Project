var MultiSigWallet = artifacts.require("MultiSigWallet");

module.exports = function(deployer) {
  deployer.deploy(
    MultiSigWallet, 
    [
      '0x1FcFa5fABdD95EFf80897F025F2F50d05e1bB2E6',
      '0x54d1669b2C3C90841f1030714652325a8184D8b7',
      '0xA2775DC9bF55aa3B1e1d453280358F866994Ed03',
    ]
  );
};