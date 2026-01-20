import { Shelf } from "../models/shelf.model.js";
import { BookInShelf } from "../models/bookInShelf.js";

export async function clearShelf(shelfId, session) {
  // deletes all books in shelf
  await BookInShelf.deleteMany({ shelfId }).session(session);
}

export async function deleteShelfAfterClear(shelfId, session) {
  await clearShelf(shelfId, session);
  await Shelf.deleteOne({ _id: shelfId }).session(session);
}
