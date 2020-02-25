const { gql } = require("apollo-server");
import bodybuilder from "bodybuilder";

import client from "./api/elasticsearch.js";

export const schema = gql`
  extend type Query {
    correlation(
      dashboardID: String!
      labels: [AttributeInput!]
    ): [CorrelationCell!]!
  }

  type CorrelationCell {
    x: StringOrNum!
    y: StringOrNum!
  }
`;

export const resolvers = {
  Query: {
    async correlation(_, { dashboardID, labels }) {


      const x_label = labels[0]['label'];
      const y_label = labels[1]['label'];

      const cell_query = bodybuilder()
        .filter("term", "dashboard_id", dashboardID)
        .size(50000)
        .build();

        // const cell_query = bodybuilder()
        //   .filter("term", "dashboard_id", dashboardID)
        //   .filter("term", "gene", x_label)
        //   .size(50000)
        //   .build();
        // var x_cell = false;

        // const gene_results = await client.search({
        //   index: "dashboard_genes",
        //   body: cell_query
        // });

      const cell_results = await client.search({
        index: "dashboard_cells",
        body: cell_query
      });
      var cells = cell_results['hits']['hits'];

      var correlation_cells = [];
      cells.forEach(function (cell) { correlation_cells.push({"x": cell["_source"][x_label], "y": cell["_source"][y_label]})})

      return correlation_cells;
    }
  }
};
