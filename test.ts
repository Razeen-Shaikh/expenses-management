const { expect } = require("chai");
const ExpenseManager = require("./ExpenseManager");

describe("ExpenseManager", () => {
  let manager: {
    moveIn: (arg0: string) => void;
    spend: (arg0: number, arg1: string, arg2: string[]) => void;
    checkDues: (arg0: string) => any;
    clearDue: (arg0: string, arg1: string, arg2: number) => void;
    moveOut: (arg0: string) => any;
  };

  beforeEach(() => {
    manager = new ExpenseManager();
  });

  describe("MOVE_IN", () => {
    it("should add new members until full", () => {
      expect(manager.moveIn("ANDY")).to.equal("SUCCESS");
      expect(manager.moveIn("WOODY")).to.equal("SUCCESS");
      expect(manager.moveIn("BO")).to.equal("SUCCESS");
      expect(manager.moveIn("REX")).to.equal("HOUSEFUL");
    });

    it("should return SUCCESS if member already exists", () => {
      manager.moveIn("ANDY");
      expect(manager.moveIn("ANDY")).to.equal("SUCCESS");
    });
  });

  describe("SPEND", () => {
    beforeEach(() => {
      manager.moveIn("ANDY");
      manager.moveIn("WOODY");
      manager.moveIn("BO");
    });

    it("should record a valid spend and update dues", () => {
      expect(manager.spend(3000, "ANDY", ["ANDY", "WOODY", "BO"])).to.equal(
        "SUCCESS"
      );
      const duesBO = manager.checkDues("BO");
      expect(duesBO).to.be.an("array");
      expect(duesBO).to.have.lengthOf(2);
      expect(duesBO).to.deep.include("ANDY 1000");
    });

    it("should return MEMBER_NOT_FOUND for non-member spender", () => {
      expect(manager.spend(1000, "REX", ["ANDY", "REX"])).to.equal(
        "MEMBER_NOT_FOUND"
      );
    });

    it("should return MEMBER_NOT_FOUND if any participant is not a member", () => {
      expect(manager.spend(1000, "ANDY", ["ANDY", "REX"])).to.equal(
        "MEMBER_NOT_FOUND"
      );
    });

    it("should return nothing if only one participant", () => {
      expect(manager.spend(1000, "ANDY", ["ANDY"])).to.be.undefined;
    });
  });

  describe("DUES", () => {
    beforeEach(() => {
      manager.moveIn("ANDY");
      manager.moveIn("BO");
      manager.spend(1000, "ANDY", ["ANDY", "BO"]);
    });

    it("should return correct dues for a member", () => {
      const dues = manager.checkDues("BO");
      expect(dues).to.deep.equal(["ANDY 500"]);
    });

    it("should return MEMBER_NOT_FOUND for unknown member", () => {
      expect(manager.checkDues("WOODY")).to.equal("MEMBER_NOT_FOUND");
    });
  });

  describe("CLEAR_DUE", () => {
    beforeEach(() => {
      manager.moveIn("ANDY");
      manager.moveIn("BO");
      manager.spend(1000, "ANDY", ["ANDY", "BO"]);
    });

    it("should allow valid due clearance", () => {
      expect(manager.clearDue("BO", "ANDY", 500)).to.equal("0");
      expect(manager.checkDues("BO")).to.deep.equal(["ANDY 0"]);
    });

    it("should allow partial due clearance", () => {
      expect(manager.clearDue("BO", "ANDY", 300)).to.equal("200");
      expect(manager.checkDues("BO")).to.deep.equal(["ANDY 200"]);
    });

    it("should return INCORRECT_PAYMENT for overpayment", () => {
      expect(manager.clearDue("BO", "ANDY", 800)).to.equal("INCORRECT_PAYMENT");
    });

    it("should return MEMBER_NOT_FOUND if borrower or lender is invalid", () => {
      expect(manager.clearDue("REX", "ANDY", 500)).to.equal("MEMBER_NOT_FOUND");
      expect(manager.clearDue("BO", "REX", 500)).to.equal("MEMBER_NOT_FOUND");
    });
  });

  describe("MOVE_OUT", () => {
    it("should allow move out if no dues exist", () => {
      manager.moveIn("ANDY");
      expect(manager.moveOut("ANDY")).to.equal("SUCCESS");
    });

    it("should block move out if member owes dues", () => {
      manager.moveIn("ANDY");
      manager.moveIn("BO");
      manager.spend(1000, "ANDY", ["ANDY", "BO"]);
      expect(manager.moveOut("BO")).to.equal("FAILURE");
    });

    it("should block move out if others owe to member", () => {
      manager.moveIn("ANDY");
      manager.moveIn("BO");
      manager.spend(1000, "ANDY", ["ANDY", "BO"]);
      manager.clearDue("BO", "ANDY", 250);
      expect(manager.moveOut("ANDY")).to.equal("FAILURE");
    });

    it("should allow move out after dues are settled", () => {
      manager.moveIn("ANDY");
      manager.moveIn("BO");
      manager.spend(1000, "ANDY", ["ANDY", "BO"]);
      manager.clearDue("BO", "ANDY", 500);
      manager.clearDue("ANDY", "BO", 0);
      expect(manager.moveOut("BO")).to.equal("SUCCESS");
      expect(manager.moveOut("ANDY")).to.equal("SUCCESS");
    });

    it("should return MEMBER_NOT_FOUND if member does not exist", () => {
      expect(manager.moveOut("REX")).to.equal("MEMBER_NOT_FOUND");
    });
  });

  describe("Debt Cancellation", () => {
    it("should cancel mutual dues", () => {
      manager.moveIn("ANDY");
      manager.moveIn("BO");

      manager.spend(1000, "ANDY", ["ANDY", "BO"]);
      manager.spend(1000, "BO", ["ANDY", "BO"]);

      expect(manager.checkDues("ANDY")).to.deep.equal(["BO 0"]);
      expect(manager.checkDues("BO")).to.deep.equal(["ANDY 0"]);
    });
  });
});
