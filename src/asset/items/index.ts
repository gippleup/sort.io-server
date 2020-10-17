import { expressionList } from "./expression";
import { skinList } from "./skin";

export type ItemCategory = 
  "skin"
  | "expression";

export const itemList = {
  skin: {
    ...skinList,
  },
  expression: {
    ...expressionList,
  }
}