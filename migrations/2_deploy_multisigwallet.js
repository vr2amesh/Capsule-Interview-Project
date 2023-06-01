var MultiSigWallet = artifacts.require("MultiSigWallet");

module.exports = function(deployer) {
  deployer.deploy(
    MultiSigWallet, 
    [
      '0xC354db93396b40d16b716D9D223076C1226c2969',
      '0x7d05098984c73C8f86d83d902301d59189cc6e98',
      '0x4c111a85401F7f1229ADEDB513021e022bF8920b',
    ]
  );
};
