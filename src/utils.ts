import type { IDefinition, INode, Value } from "tripetto-runner-foundation";
import * as R from "remeda";

// note(richard): note sure why TS complains about being unable to import ICluster
type ICluster = IDefinition["clusters"][number];
const getNodes = <Metadata extends Record<string, any>>(
  nodes: INode[],
  metadata?: Metadata
) => {
  // early return if empty
  if (nodes.length < 1) return [];

  let parsedNodes = [] as (Pick<INode, "name" | "description"> & Metadata)[];

  for (const node of nodes) {
    // skip if a node doesn't have a block (it has no functionality other than supplying static text to the runner)
    if (!node.block) continue;

    // pick only relevant fields
    const pickedProps = R.pick(node, ["name", "description"]);
    const withMetadata = { ...pickedProps, ...(metadata && metadata) } as Pick<
      INode,
      "name" | "description"
    > &
      Metadata;
    // append nodes
    parsedNodes.push(withMetadata);
  }

  return parsedNodes;
};

const parseClustersToArray = <Metadata extends Record<string, any>>(
  clusters: ICluster[],
  array: (Pick<INode, "description" | "name"> & Metadata)[],
  metadata?: Metadata
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
      const clusterNodes = getNodes(nodes, metadata);
      array.push(...clusterNodes);
    }
  }
};

export { parseClustersToArray };
