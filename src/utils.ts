import type { IDefinition, INode } from "tripetto-runner-foundation";
import * as R from "remeda";

// note(richard): note sure why TS complains about being unable to import ICluster
type ICluster = IDefinition["clusters"][number];

const getNodes = (nodes: INode[]) => {
  // early return if empty
  if (nodes.length < 1) return [];

  let parsedNodes = [] as Pick<INode, "name" | "description">[];

  for (const node of nodes) {
    // skip if a node doesn't have a block (it has no functionality other than supplying static text to the runner)
    if (!node.block) continue;

    // pick only relevant fields
    const pickedNodes = R.pick(node, ["name", "description"]);

    // append nodes
    parsedNodes.push(pickedNodes);
  }

  return parsedNodes;
};

const parseClustersToArray = (
  clusters: ICluster[],
  array: Pick<INode, "description" | "name">[]
) => {
  // early return if no cluster present
  if (clusters.length < 1) return;

  for (const cluster of clusters) {
    // early return if the cluster doesn't contain nodes/branches
    if (!cluster.nodes && !cluster.branches) return;

    const { branches, nodes } = cluster;

    // parse branches recursively if present
    if (branches) {
      for (const branch of branches) {
        // skip branch if it doesn't contain a cluster
        if (!branch.clusters) continue;
        const clusters = branch.clusters;
        parseClustersToArray(clusters, array);
      }
    }

    // append to array
    if (nodes) {
      const clusterNodes = getNodes(nodes);
      array.push(...clusterNodes);
    }
  }
};

export { parseClustersToArray };
