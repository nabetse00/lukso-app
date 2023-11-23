import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { createUP, deployContractAsUp, executeAsUp } from "./helper";

const MockTokenContractName = "MockToken"


describe("Mock Token Tests", function () {

  async function deployWithEOAFixture() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const MockTokenFactory = await ethers.getContractFactory("MockToken");
    const initialSupply = ethers.parseEther("200")
    const MockToken = await MockTokenFactory.deploy("My Custom Token", "MCT", initialSupply);
    console.log(`owener addr is: ${await owner.getAddress()}`)

    return { MockToken: MockToken, initialSupply, owner, otherAccount };
  }

  async function deployWithUpFixture() {
    await network.provider.send("evm_setIntervalMining", [[3000, 5000]]);
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();
    const initialSupply = ethers.parseEther("200")

    const UP = await createUP()
    const UP_other = await createUP()
    const contructorArgs = ["my token", "Mtk", initialSupply]
    const tokenAddress = await deployContractAsUp(UP, "MockToken", contructorArgs)
    const MockToken = await ethers.getContractAt("MockToken", tokenAddress)

    return { MockToken, initialSupply, owner, otherAccount, UP, UP_other };
  }

  describe("Deployment with EAO", function () {
    it("Should set the right initial supply", async function () {
      const { MockToken, initialSupply, owner, otherAccount } = await loadFixture(deployWithEOAFixture);
      expect(await MockToken.totalSupply()).to.equal(initialSupply);
    });

    it("Should set the right owner", async function () {
      const { MockToken, owner } = await loadFixture(deployWithEOAFixture);
      expect(await MockToken.owner()).to.equal(owner.address);
    });

    it("Should set the right balances", async function () {
      const { MockToken, owner, otherAccount, initialSupply } = await loadFixture(
        deployWithEOAFixture
      );
      expect(await MockToken.balanceOf(owner)).to.equal(
        initialSupply
      );
      expect(await MockToken.balanceOf(otherAccount)).to.equal(
        0
      );
    });

    it("Should be able to mint", async function () {
      const { MockToken, owner, otherAccount } = await loadFixture(deployWithEOAFixture);
      const amount_to_mint = ethers.parseEther("20")
      const reverted = MockToken.mint(otherAccount.address, amount_to_mint, false, "0x")
      await expect(reverted).to.be.reverted
      const valid = MockToken.mint(otherAccount.address, amount_to_mint, true, "0x")
      await expect(valid).to.be.not.reverted
      expect(await MockToken.balanceOf(otherAccount)).to.equal(
        amount_to_mint
      );
    });
    it("Should be able to transfer as EOA, LSP7 call", async function () {
      const { MockToken, owner, otherAccount } = await loadFixture(deployWithEOAFixture);
      const prev_bal = await MockToken.balanceOf(otherAccount)
      const amount_to_send = ethers.parseEther("10")
      // const reverted = MockToken.transfer(owner.address, otherAccount.address, amount_to_send, false, "0x")
      // => ambiguous `transfer` functions the signature must also be specified
      const reverted = MockToken["transfer(address,address,uint256,bool,bytes)"](owner.address, otherAccount.address, amount_to_send, false, "0x")
      await expect(reverted).to.be.reverted
      //const valid = MockToken.transfer(owner.address, otherAccount.address, amount_to_send, true, "0x")
      // => ambiguous `transfer` functions the signature must also be specified
      const valid = MockToken["transfer(address,address,uint256,bool,bytes)"](owner.address, otherAccount.address, amount_to_send, true, "0x")
      await expect(valid).to.be.not.reverted
      expect(await MockToken.balanceOf(otherAccount)).to.equal(
        amount_to_send + prev_bal
      );
    });
    it("Should be able to transfer as EOA, ERC20 call", async function () {
      const { MockToken, owner, otherAccount } = await loadFixture(deployWithEOAFixture);
      const prev_bal = await MockToken.balanceOf(otherAccount)
      const amount_to_send = ethers.parseEther("0.18")
      // const reverted = MockToken.transfer(owner.address, otherAccount.address, amount_to_send, false, "0x")
      // => ambiguous `transfer` functions the signature must also be specified
      const valid = MockToken["transfer(address,uint256)"](otherAccount.address, amount_to_send)
      await expect(valid).to.be.not.reverted
      expect(await MockToken.balanceOf(otherAccount)).to.equal(
        amount_to_send + prev_bal
      );
    });
    it("should be able to dispense EOA", async function () {
      const { MockToken, owner, otherAccount } = await loadFixture(deployWithEOAFixture);
      const prev_bal = await MockToken.balanceOf(otherAccount)
      const dispensedAmount = ethers.parseEther("10")
      const valid = MockToken.dispense(otherAccount.address)
      await expect(valid).to.be.not.reverted
      await (await valid).wait()
      expect(await MockToken.balanceOf(otherAccount)).to.equal(
         dispensedAmount + prev_bal
      );
    });
  });



  describe("Deployment with Universal Profile", function () {
    it("Should set the right initial supply", async function () {
      const { MockToken, initialSupply, owner, otherAccount } = await loadFixture(deployWithUpFixture);
      expect(await MockToken.totalSupply()).to.equal(initialSupply);
    });

    it("Should set the right owner", async function () {
      const { MockToken, owner, UP } = await loadFixture(deployWithUpFixture);

      expect(await MockToken.owner()).to.equal(UP.address);
    });

    it("Should set the right balances", async function () {
      const { MockToken, owner, otherAccount, initialSupply, UP } = await loadFixture(
        deployWithUpFixture
      );


      expect(await MockToken.balanceOf(UP.address)).to.equal(
        initialSupply
      );
      expect(await MockToken.balanceOf(owner)).to.equal(
        0
      );
      expect(await MockToken.balanceOf(otherAccount)).to.equal(
        0
      );
    });



    it("Should be able to mint", async function () {
      const { MockToken, owner, otherAccount, UP } = await loadFixture(deployWithUpFixture);
      const amount_to_mint = ethers.parseEther("20")

      await expect(executeAsUp(UP, MockTokenContractName,
        await MockToken.getAddress(),
        "mint",
        [otherAccount.address, amount_to_mint, false, "0x"])
      ).to.be.reverted

      await expect(executeAsUp(UP, MockTokenContractName,
        await MockToken.getAddress(),
        "mint",
        [otherAccount.address, amount_to_mint, true, "0x"])
      ).to.be.not.reverted

      expect(await MockToken.balanceOf(otherAccount)).to.equal(
        amount_to_mint
      );
    });

    it("Should be able to transfer with LSP7 transfert call", async function () {
      const { MockToken, owner, otherAccount, UP } = await loadFixture(deployWithUpFixture);
      const prev_bal_up = await MockToken.balanceOf(UP.address)
      const prev_bal_other = await MockToken.balanceOf(otherAccount.address)
      const amount_to_send = ethers.parseEther("2")

      await expect(executeAsUp(UP, MockTokenContractName,
        await MockToken.getAddress(),
        "transfer(address,address,uint256,bool,bytes)", // ambigous function so pass complete sig
        [UP.address, otherAccount.address, amount_to_send, false, "0x"])
      ).to.be.reverted

      await expect(executeAsUp(UP, MockTokenContractName,
        await MockToken.getAddress(),
        "transfer(address,address,uint256,bool,bytes)", // ambigous function so pass complete sig
        [UP.address, otherAccount.address, amount_to_send, true, "0x"])
      ).to.be.not.reverted

      expect(await MockToken.balanceOf(otherAccount)).to.equal(
        amount_to_send + prev_bal_other
      );
      expect(await MockToken.balanceOf(UP.address)).to.equal(
        prev_bal_up - amount_to_send
      );
    });

    it("Should be able to transfer with ERC20 transfer call", async function () {
      const { MockToken, owner, otherAccount, UP } = await loadFixture(deployWithUpFixture);
      const prev_bal_up = await MockToken.balanceOf(UP.address)
      const prev_bal_other = await MockToken.balanceOf(otherAccount.address)
      const amount_to_send = ethers.parseEther("2")

      await expect(executeAsUp(UP, MockTokenContractName,
        await MockToken.getAddress(),
        "transfer(address,uint256)", // ambigous function so pass complete sig
        [otherAccount.address, amount_to_send])
      ).to.be.not.reverted

      expect(await MockToken.balanceOf(otherAccount)).to.equal(
        amount_to_send + prev_bal_other
      );
      expect(await MockToken.balanceOf(UP.address)).to.equal(
        prev_bal_up - amount_to_send
      );
    });

    it("should be able to dispense UP", async function () {
      const { MockToken, owner, otherAccount, UP_other} = await loadFixture(deployWithUpFixture);
      const prev_bal = await MockToken.balanceOf(UP_other.address)
      const dispensedAmount = ethers.parseEther("10")
      const valid = executeAsUp(UP_other, "MockToken", await MockToken.getAddress(), "dispense", [UP_other.address])
      await expect(valid).to.be.not.reverted
      await (await valid).wait()
      
      expect(await MockToken.balanceOf(UP_other.address)).to.equal(
         dispensedAmount + prev_bal
      );
    });
  });

  
});
