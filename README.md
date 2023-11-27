# Lukso Auctions

![Lukso Auctions](./images/logo_banner.png)


## Introduction

Lukso Auctions is a Auction page which leverages and showcases the power of universal profiles to 
offer user web3 power and web2 familiar and simple UX.

## Features

This project showcases features of lukso Universal Profiles.

- Universal Profile Relayer: allows a third party to pay for gas so users are not required to own native token `LYX`.
- Universal Profiles batch execution: one clic for approval and execution.
- Universal Profiles: use  Universal Receiver Delegate for notifications.
- LSP8 NFTS: items are represented as unique LSP8 NFTS for better interaction with Universal Profiles. 
- LSP7 Tokens: items are payed with LSP7 tokens for better interaction with Universal Profiles.

The example app is an item auction with a one clic buy it now button.

Please follow: 
- [Video](https://www.youtube.com/watch?v=xxxx) 
- [Demo site](https://nabetse00.github.io/xxxx)

For more details.

## Project structure

- `/contracts`: smart contracts.
- `/deploy`: deployment and contract interaction scripts.
- `/test`: test files
- `hardhat.config.ts`: configuration file.
- `/frontend`: demo site source code

### Environment variables

In order to prevent users to leak private keys, this project includes the `dotenv` package which is used to load environment variables. It's used to load the wallet private key, required to run the deploy script.

To use it, copy `.env.template` to `.env` and fill it with your data.

```
TESTNET_EOA_PRIVATE_KEY=123cde574ccff....
```

For hardhat localnet deployment copy `.env.dev.template` to `.env.dev` and fill it with your data.


## Contracts

- [AuctionItems](./contracts/AuctionItems.sol) LSP8 NFT colection representing an items Auction.
- [Auction](./contracts/Auction.sol) Auction contract with bid increments computed from item actual price and support for  **buy it now** price.
- [AuctionFactory](./contracts/Auction_factory.sol) Auctions creation contract.
- [mocks](./contracts/mock/MockToken.sol) for usdc and dai mock contracts **with** a dispenser function.
- [CustomToken](./contracts/CustomToken.sol) folder for usdc and dai custom LSP7 contracts **without** a dispenser functions.

Lukso tesnet deployed contract:
- MOCK USDC: [0xc5966895Be96BE5cc6DE336B63fD41F60c75B917](https://explorer.execution.testnet.lukso.network/address/0xc5966895Be96BE5cc6DE336B63fD41F60c75B917)

- MOCK DAI: [0x1dBC835aA6f1889842dE9e0e2a64E54d15C62a11](https://explorer.execution.testnet.lukso.network/address/0x1dBC835aA6f1889842dE9e0e2a64E54d15C62a11)

- AUCTION_FACTORY: [0x0BC186C5A0bC200958aaA3c8c10C02590D874aEf](https://explorer.execution.testnet.lukso.network/address/0x0BC186C5A0bC200958aaA3c8c10C02590D874aEf)


Remember AuctionFactory creates its own NFT representing Auctions items:
[0xb8608c56509f880e5b071ad31019ed2c42d5bc98](https://explorer.execution.testnet.lukso.network/address/0xb8608c56509f880e5b071ad31019ed2c42d5bc98)

And Auction contracts are added when you create an `Auction`.

## Deployement and test on Hardhat Localnet

### test
Run localnet in a terminal:
```console
 npx hardhat node
```

Wait for 
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
...
Account #19: 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199 (10000 ETH)
Private Key: 0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e

WARNING: These accounts, and their private keys, are publicly known.
Any funds sent to them on Mainnet or any other live network WILL BE LOST.
```

In another terminal:
```console
npx hardhat test --network localhost 
```

All tests should pass:
```
35 passing (1m)
```

### Size and gas reports

See [contract sizes](./contracts-sizes.txt) and [gas repport](./report-gas-lukso.txt) files for details.

### Localnet deployment

Set environment variable mode to locanet:

```powershell
$env:mode="localnet" 
```
or in bash
```bash
export mode="localnet"
```
and run:
```
npx hardhat run .\scripts\deployXXXX.ts
```
for example:
```
npx hardhat run .\scripts\deployAuctionFactory.ts
```
to deploy AuctionFactory on localnet. Results:

```
loading localnet dev envs
🔑 EOA:  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
🆙 fake usdc token deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
🆙 fake dai token deployed at: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
🆙 Universal Profile: 0xCace1b78160AE76398F486c8a18044da0d66d86D
🆙LOCALNET_AUCTION_FACTORY_ADDR="0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
```

A file [contract.txt](./contracts.txt) is generated with latest addresses
of deployed contracts

## Deployement on lukso testnet

Set environment variable mode to testnet:

```powershell
$env:mode="testnet" 
```
or in bash
```bash
export mode="testnet"
```
and run:
```
npx hardhat run .\scripts\deployXXXX.ts
```

Don't forget to add your data [.env](./.env.template) and that your EOA has some `LYX` to pay for gas.

Tesnet addresses:

- MOCK USDC: [0xc5966895Be96BE5cc6DE336B63fD41F60c75B917](https://explorer.execution.testnet.lukso.network/address/0xc5966895Be96BE5cc6DE336B63fD41F60c75B917)

verified with
```
npx hardhat verify "0xc5966895Be96BE5cc6DE336B63fD41F60c75B917" --network luksoTestnet --constructor-args .\fake_usdc_arguments.js
```

- MOCK DAI: [0x1dBC835aA6f1889842dE9e0e2a64E54d15C62a11](https://explorer.execution.testnet.lukso.network/address/0x1dBC835aA6f1889842dE9e0e2a64E54d15C62a11)

```
npx hardhat verify "0x1dBC835aA6f1889842dE9e0e2a64E54d15C62a11" --network luksoTestnet --constructor-args .\fake_dai_arguments.js 
```
- Auction Factory: [0x0BC186C5A0bC200958aaA3c8c10C02590D874aEf](https://explorer.execution.testnet.lukso.network/address/0x0BC186C5A0bC200958aaA3c8c10C02590D874aEf)
```
npx hardhat verify "0x0BC186C5A0bC200958aaA3c8c10C02590D874aEf" --network luksoTestnet --constructor-args .\auction_factory_arguments.js
```

# Front end

Check [REAME](./frontend/README.md) inside `./frontend` folder.

Demo web site is also deployed [here](http://whatever)

