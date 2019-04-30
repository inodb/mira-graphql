import "@babel/polyfill";

import { ApolloServer } from "apollo-server-express";
import { gql } from "apollo-server";

import { GraphQLScalarType, Kind } from "graphql";

import * as cells from "./cells";
import * as patients from "./patients";
import * as colorLabels from "./colorLabels";

import { merge } from "lodash";

const baseSchema = gql`
  type Query {
    _blank: String
  }

  scalar StringOrNum
`;

const baseResolvers = {
  StringOrNum: new GraphQLScalarType({
    name: "StringOrNum",
    description: "A String or a Num union type",
    serialize(value) {
      if (typeof value !== "string" && typeof value !== "number") {
        throw new Error("Value must be either a String or a Number");
      }
      return value;
    },
    parseValue(value) {
      if (typeof value !== "string" && typeof value !== "number") {
        throw new Error("Value must be either a String or an Int");
      }

      return value;
    },
    parseLiteral(ast) {
      switch (ast.kind) {
        case Kind.FIELD:
          return parseFloat(ast.value);
        case Kind.INT:
          return parseInt(ast.value, 10);
        case Kind.STRING:
          return ast.value;
        default:
          throw new Error("Value must be either a String or a Number");
      }
    }
  })
};

const server = new ApolloServer({
  typeDefs: [baseSchema, cells.schema, patients.schema, colorLabels.schema],
  resolvers: merge(
    baseResolvers,
    cells.resolvers,
    patients.resolvers,
    colorLabels.resolvers
  )
});

const express = require("express");
const app = express();
server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);
