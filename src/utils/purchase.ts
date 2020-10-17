import { getConnection, getRepository } from "typeorm";
import { ItemCategory, itemList } from "../asset/items"
import { expressionList } from "../asset/items/expression";
import { skinList } from "../asset/items/skin"
import { PurchaseHistory } from "../entity/PurchaseHistory";
import { getUserById, setUserData } from "./user";

type ItemList = typeof itemList;
type ItemListKeys = keyof typeof itemList;
type ItemDef = {
  category: ItemListKeys;
  name: keyof ItemList["expression"]
  | keyof ItemList["skin"]
}

export const addPurchaseHistory = async (userId: number, itemDef: ItemDef, price: number) => {
  const { category, name } = itemDef;
  const user = await getUserById(userId);
  const purchaseHistoryRepo = await getRepository(PurchaseHistory);
  if (user) {
    const leftGold = user.gold - price;
    if (leftGold < 0) throw new Error('Not enough mineral!')
    const purchaseHistory = new PurchaseHistory();
    purchaseHistory.category = category;
    purchaseHistory.userId = userId;
    purchaseHistory.item = name;
    purchaseHistory.price = 0;
    purchaseHistory.expense = 0;
    purchaseHistory.leftGold = leftGold;
    await purchaseHistoryRepo.save(purchaseHistory);

    if (price <= 0) return;

    await setUserData(userId, {
      gold: leftGold,
    });
  }
}


export const purchase = async (userId: number, itemDef: ItemDef) => {
  let price = 0;
  const {category, name} = itemDef;
  if (category === "expression") {
    price = itemList[category][name as keyof ItemList["expression"]].price;
  } else if (category === "skin") {
    price = itemList[category][name as keyof ItemList["skin"]].price;
  }
  await addPurchaseHistory(userId, itemDef, price);
}

export const getCheckedItemList = async (userId: number) => {
  const purchaseHistoryRepo = await getRepository(PurchaseHistory);
  const existingItem = await purchaseHistoryRepo.find({
    where: {
      userId,
    }
  });

  const mappedList = Object.entries(itemList).map(([category, item]) => {
    const mappedItems = Object.entries(item).map(([name, prop]) => {
      const existing = existingItem.find((el) => el.item === name);
      const mappedProp = {
        category,
        name,
        price: prop.price,
        currency: "gold",
        hasOwned: existing !== undefined,
      }
      return mappedProp;
    });
    return mappedItems;
  })
  .reduce((acc, ele) => acc.concat(ele))
  return mappedList;
}