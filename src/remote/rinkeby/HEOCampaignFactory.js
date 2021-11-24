//HEOCampaignFactory ABI and address
const abi=[{"inputs":[{"internalType":"contract HEODAO","name":"dao","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"campaignAddress","type":"address"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"beneficiary","type":"address"},{"indexed":false,"internalType":"uint256","name":"maxAmount","type":"uint256"},{"indexed":false,"internalType":"address","name":"token","type":"address"}],"name":"CampaignDeployed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"maxAmount","type":"uint256"},{"internalType":"address","name":"token","type":"address"},{"internalType":"address payable","name":"beneficiary","type":"address"},{"internalType":"string","name":"metaData","type":"string"}],"name":"createCampaign","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"maxAmount","type":"uint256"},{"internalType":"address","name":"token","type":"address"},{"internalType":"address payable","name":"beneficiary","type":"address"},{"internalType":"string","name":"metaData","type":"string"}],"name":"createRewardCampaign","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}];
const address = "0x52B0Ced1fBEbb8082D0a4b343246b71e594d6a50";

export {abi, address};
