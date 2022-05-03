import * as path from "path";
import superjson from "superjson";
import { parseClustersToArray } from "./utils";
import type { IDefinition, INode } from "tripetto-runner-foundation";
import { inputs } from "./input";
import { CsvFile } from "./csv";

// parse form clusters into global questions
let metadata = {} as { formName: string; program: string };
let questions = [] as (Pick<INode, "name" | "description"> & typeof metadata)[];
for (const input of inputs) {
  const form = superjson.stringify(input.form);
  const { clusters } = superjson.parse<Pick<IDefinition, "clusters">>(form);
  metadata = { formName: input.name, program: input.program };
  // mutate questions
  parseClustersToArray(clusters, questions, metadata);
}

const outputPath = path.resolve(__dirname, "..", "output.csv");
// write output to csv
const csvFile = new CsvFile({
  path: outputPath,
  headers: ["name", "description", ...(metadata && Object.keys(metadata))],
  quoteColumns: true,
});
const [firstRow, ...otherRows] = questions;
csvFile
  // delete & re-create with first row data (note: row is required from fast-csv)
  .overrideOrCreate([firstRow])
  // append the other rows
  .then(() => {
    return csvFile.append(otherRows);
  })
  // read the file afterwards
  .then(() => csvFile.read())
  .then((contents) => {
    console.log(`wrote to file: ${contents}`);
  })
  .catch((err) => {
    console.error(err.stack);
    process.exit(1);
  });
