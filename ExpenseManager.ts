class ExpenseManager {
  private members: string[] = [];
  private dues: { [from: string]: { [to: string]: number } } = {};

  constructor() {}

  moveIn(name: string) {
    if (this.members.includes(name)) return "SUCCESS";
    if (this.members.length >= 3) return "HOUSEFUL";

    this.members.push(name);
    if (!this.dues[name]) this.dues[name] = {};
    return "SUCCESS";
  }

  moveOut(name: string) {
    if (!this.members.includes(name)) return "MEMBER_NOT_FOUND";

    const owesOthers = Object.values(this.dues[name] || {}).some((v) => v > 0);
    const owedByOthers = this.members
      .filter((m) => m !== name)
      .some((m) => (this.dues[m]?.[name] || 0) > 0);

    if (owesOthers || owedByOthers) return "FAILURE";

    this.members = this.members.filter((m) => m !== name);
    delete this.dues[name];
    for (let m of Object.keys(this.dues)) {
      delete this.dues[m]?.[name];
    }
    return "SUCCESS";
  }

  spend(amount: number, paidBy: string, sharedBy: string[]) {
    if (this.members.length < 2) return;

    if (sharedBy.length < 2) return;

    if (
      !this.members.includes(paidBy) ||
      sharedBy.some((m) => !this.members.includes(m))
    ) {
      return "MEMBER_NOT_FOUND";
    }

    const share = Math.round(amount / sharedBy.length);

    for (let member of sharedBy) {
      if (member === paidBy) continue;

      const owedToPaidBy = this.dues[member]?.[paidBy] || 0;
      const paidByOwesToMember = this.dues[paidBy]?.[member] || 0;

      const netDue = share - paidByOwesToMember;

      if (netDue > 0) {
        if (!this.dues[member]) this.dues[member] = {};
        this.dues[member][paidBy] = owedToPaidBy + netDue;

        if (this.dues[paidBy]?.[member]) {
          this.dues[paidBy][member] = 0;
        }
      } else {
        if (!this.dues[paidBy]) this.dues[paidBy] = {};
        this.dues[paidBy][member] = paidByOwesToMember - share;

        if (this.dues[member]?.[paidBy]) {
          this.dues[member][paidBy] = 0;
        }
      }
    }

    return "SUCCESS";
  }

  clearDue(from: string, to: string, amount: number) {
    const due = this.dues[from]?.[to] || 0;

    if (!this.members.includes(from) || !this.members.includes(to)) {
      return "MEMBER_NOT_FOUND";
    }

    if (amount > due) return "INCORRECT_PAYMENT";

    if (this.dues[from]?.[to] !== undefined) {
      this.dues[from][to] -= amount;
    }

    if (this.dues[from]?.[to] === 0) {
      delete this.dues[from][to];
      if (Object.keys(this.dues[from]).length === 0) {
        delete this.dues[from];
      }
      return "0";
    }

    return this.dues[from]?.[to]?.toString();
  }

  checkDues(name: string) {
    if (!this.members.includes(name)) return "MEMBER_NOT_FOUND";

    const duesList: { to: string; amount: number }[] = [];

    if (this.dues[name]) {
      for (let to in this.dues[name]) {
        duesList.push({ to, amount: this.dues[name][to] ?? 0 });
      }
    }

    for (let other of this.members) {
      if (other === name) continue;
      const reverseDue = this.dues[other]?.[name] || 0;
      const alreadyIncluded = duesList.find((d) => d.to === other);
      if (!alreadyIncluded) {
        duesList.push({ to: other, amount: 0 });
      }
    }

    duesList.sort((a, b) => {
      if (b.amount !== a.amount) return b.amount - a.amount;
      return a.to.localeCompare(b.to);
    });

    return duesList.map((d) => `${d.to} ${d.amount}`);
  }
}

module.exports = ExpenseManager;
