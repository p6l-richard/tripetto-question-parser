import superjson from "superjson";
import { parseClustersToArray } from "./utils";
import type { IDefinition, INode } from "tripetto-runner-foundation";
import { format } from "@fast-csv/format";
import { inputs } from "./input";

// parse form clusters into global questions
let questions = [] as Pick<INode, "name" | "description">[];
for (const input of inputs) {
  const form = superjson.stringify(input);
  const { clusters } = superjson.parse<Pick<IDefinition, "clusters">>(form);
  parseClustersToArray(clusters, questions);
}

// write questions to csv
const csvStream = format({ headers: true });
csvStream.pipe(process.stdout).on("end", () => process.exit());
for (const question of questions) {
  csvStream.write(question);
}
csvStream.end();
