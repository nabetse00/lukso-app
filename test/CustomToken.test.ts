import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { createUP, deployContractAsUp, executeAsUp } from "./helper";

const customTokenContractName = "CustomToken"


describe("Custom Token Tests", function () {

  async function deployWithEOAFixture() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const CustomTokenFactory = await ethers.getContractFactory("CustomToken");
    const initialSupply = ethers.parseEther("200")
    const customToken = await CustomTokenFactory.deploy("My Custom Token", "MCT", initialSupply);
    console.log(`owener addr is: ${await owner.getAddress()}`)

    return { customToken: customToken, initialSupply, owner, otherAccount };
  }

  async function deployWithUpFixture() {
    await network.provider.send("evm_setIntervalMining", [[3000, 5000]]);
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();
    const initialSupply = ethers.parseEther("200")

    const UP = await createUP()
    const contructorArgs = ["my token", "Mtk", initialSupply]
    const tokenAddress = await deployContractAsUp(UP, "CustomToken", contructorArgs)
    const customToken = await ethers.getContractAt("CustomToken", tokenAddress)

    return { customToken, initialSupply, owner, otherAccount, UP };
  }

  describe("Deployment with EAO", function () {
    it("Should set the right initial supply", async function () {
      const { customToken, initialSupply, owner, otherAccount } = await loadFixture(deployWithEOAFixture);
      expect(await customToken.totalSupply()).to.equal(initialSupply);
    });

    it("Should set the right owner", async function () {
      const { customToken, owner } = await loadFixture(deployWithEOAFixture);
      expect(await customToken.owner()).to.equal(owner.address);
    });

    it("Should set the right balances", async function () {
      const { customToken, owner, otherAccount, initialSupply } = await loadFixture(
        deployWithEOAFixture
      );
      expect(await customToken.balanceOf(owner)).to.equal(
        initialSupply
      );
      expect(await customToken.balanceOf(otherAccount)).to.equal(
        0
      );
    });

    it("Should be able to mint", async function () {
      const { customToken, owner, otherAccount } = await loadFixture(deployWithEOAFixture);
      const amount_to_mint = ethers.parseEther("20")
      const reverted = customToken.mint(otherAccount.address, amount_to_mint, false, "0x")
      await expect(reverted).to.be.reverted
      const valid = customToken.mint(otherAccount.address, amount_to_mint, true, "0x")
      await expect(valid).to.be.not.reverted
      expect(await customToken.balanceOf(otherAccount)).to.equal(
        amount_to_mint
      );
    });
    it("Should be able to transfer as EOA, LSP7 call", async function () {
      const { customToken, owner, otherAccount } = await loadFixture(deployWithEOAFixture);
      const prev_bal = await customToken.balanceOf(otherAccount)
      const amount_to_send = ethers.parseEther("10")
      // const reverted = customToken.transfer(owner.address, otherAccount.address, amount_to_send, false, "0x")
      // => ambiguous `transfer` functions the signature must also be specified
      const reverted = customToken["transfer(address,address,uint256,bool,bytes)"](owner.address, otherAccount.address, amount_to_send, false, "0x")
      await expect(reverted).to.be.reverted
      //const valid = customToken.transfer(owner.address, otherAccount.address, amount_to_send, true, "0x")
      // => ambiguous `transfer` functions the signature must also be specified
      const valid = customToken["transfer(address,address,uint256,bool,bytes)"](owner.address, otherAccount.address, amount_to_send, true, "0x")
      await expect(valid).to.be.not.reverted
      expect(await customToken.balanceOf(otherAccount)).to.equal(
        amount_to_send + prev_bal
      );
    });
    it("Should be able to transfer as EOA, ERC20 call", async function () {
      const { customToken, owner, otherAccount } = await loadFixture(deployWithEOAFixture);
      const prev_bal = await customToken.balanceOf(otherAccount)
      const amount_to_send = ethers.parseEther("0.18")
      // const reverted = customToken.transfer(owner.address, otherAccount.address, amount_to_send, false, "0x")
      // => ambiguous `transfer` functions the signature must also be specified
      const valid = customToken["transfer(address,uint256)"](otherAccount.address, amount_to_send)
      await expect(valid).to.be.not.reverted
      expect(await customToken.balanceOf(otherAccount)).to.equal(
        amount_to_send + prev_bal
      );
    });
  });


  describe("Deployment with Universal Profile", function () {
    it("Should set the right initial supply", async function () {
      const { customToken, initialSupply, owner, otherAccount } = await loadFixture(deployWithUpFixture);
      expect(await customToken.totalSupply()).to.equal(initialSupply);
    });

    it("Should set the right owner", async function () {
      const { customToken, owner, UP } = await loadFixture(deployWithUpFixture);

      expect(await customToken.owner()).to.equal(UP.address);
    });

    it("Should set the right balances", async function () {
      const { customToken, owner, otherAccount, initialSupply, UP } = await loadFixture(
        deployWithUpFixture
      );


      expect(await customToken.balanceOf(UP.address)).to.equal(
        initialSupply
      );
      expect(await customToken.balanceOf(owner)).to.equal(
        0
      );
      expect(await customToken.balanceOf(otherAccount)).to.equal(
        0
      );
    });



    it("Should be able to mint", async function () {
      const { customToken, owner, otherAccount, UP } = await loadFixture(deployWithUpFixture);
      const amount_to_mint = ethers.parseEther("20")

      await expect(executeAsUp(UP, customTokenContractName,
        await customToken.getAddress(),
        "mint",
        [otherAccount.address, amount_to_mint, false, "0x"])
      ).to.be.reverted

      await expect(executeAsUp(UP, customTokenContractName,
        await customToken.getAddress(),
        "mint",
        [otherAccount.address, amount_to_mint, true, "0x"])
      ).to.be.not.reverted

      expect(await customToken.balanceOf(otherAccount)).to.equal(
        amount_to_mint
      );
    });

    it("Should be able to transfer with LSP7 transfert call", async function () {
      const { customToken, owner, otherAccount, UP } = await loadFixture(deployWithUpFixture);
      const prev_bal_up = await customToken.balanceOf(UP.address)
      const prev_bal_other = await customToken.balanceOf(otherAccount.address)
      const amount_to_send = ethers.parseEther("2")

      await expect(executeAsUp(UP, customTokenContractName,
        await customToken.getAddress(),
        "transfer(address,address,uint256,bool,bytes)", // ambigous function so pass complete sig
        [UP.address, otherAccount.address, amount_to_send, false, "0x"])
      ).to.be.reverted

      await expect(executeAsUp(UP, customTokenContractName,
        await customToken.getAddress(),
        "transfer(address,address,uint256,bool,bytes)", // ambigous function so pass complete sig
        [UP.address, otherAccount.address, amount_to_send, true, "0x"])
      ).to.be.not.reverted

      expect(await customToken.balanceOf(otherAccount)).to.equal(
        amount_to_send + prev_bal_other
      );
      expect(await customToken.balanceOf(UP.address)).to.equal(
        prev_bal_up - amount_to_send
      );
    });

    it("Should be able to transfer with ERC20 transfer call", async function () {
      const { customToken, owner, otherAccount, UP } = await loadFixture(deployWithUpFixture);
      const prev_bal_up = await customToken.balanceOf(UP.address)
      const prev_bal_other = await customToken.balanceOf(otherAccount.address)
      const amount_to_send = ethers.parseEther("2")

      await expect(executeAsUp(UP, customTokenContractName,
        await customToken.getAddress(),
        "transfer(address,uint256)", // ambigous function so pass complete sig
        [otherAccount.address, amount_to_send])
      ).to.be.not.reverted

      expect(await customToken.balanceOf(otherAccount)).to.equal(
        amount_to_send + prev_bal_other
      );
      expect(await customToken.balanceOf(UP.address)).to.equal(
        prev_bal_up - amount_to_send
      );
    });
  });
});
