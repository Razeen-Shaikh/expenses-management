const fs = require("fs");
const ExpenseManager = require("./ExpenseManager");

const filename = process.argv[2];
const manager = new ExpenseManager();

if (!filename) {
  console.error("Please provide an input file.");
  process.exit(1);
}

fs.readFile(filename, "utf8", (err: any, data: string) => {
  if (err) throw err;

  const lines = data
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  for (const line of lines) {
    const [command, ...args] = line.split(" ");

    switch (command) {
      case "MOVE_IN": {
        if (args[0]) {
          const result = manager.moveIn(args[0]);
          console.log(result);
        }

        break;
      }

      case "SPEND": {
        const amount = Number(args[0]);
        const spender = args[1];
        const sharedWith = args.slice(1);
        if (!isNaN(amount) && spender && sharedWith.length > 0) {
          const result = manager.spend(amount, spender, sharedWith);
          console.log(result);
        }

        break;
      }

      case "DUES": {
        if (args[0]) {
          const result = manager.checkDues(args[0]);

          if (result === "MEMBER_NOT_FOUND") {
            console.log(result);
          } else if (result.length === 0) {
            console.log("CLEAR");
          } else {
            console.log(result.join("\n"));
          }
        }

        break;
      }

      case "CLEAR_DUE": {
        const [borrower, lender, amountStr] = args;
        const amount = Number(amountStr);

        if (!isNaN(amount) && borrower && lender) {
          const result = manager.clearDue(borrower, lender, amount);
          console.log(result);
        }

        break;
      }

      case "MOVE_OUT": {
        if (args[0]) {
          const result = manager.moveOut(args[0]);
          console.log(result);
        }

        break;
      }

      default:
        console.log(`UNKNOWN_COMMAND ${command}`);
        break;
    }
  }
});
