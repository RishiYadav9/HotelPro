import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../../data");
const DB_FILE = path.join(DATA_DIR, "hotelpro_db.json");

function makeId() {
  return crypto.randomBytes(12).toString("hex");
}

class EmbeddedStore {
  constructor() {
    this.data = {
      users: [],
      rooms: [],
      bookings: [],
      reviews: []
    };
    this.loaded = false;
  }

  init() {
    if (this.loaded) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(raw);
        if (!this.data.users) this.data.users = [];
        if (!this.data.rooms) this.data.rooms = [];
        if (!this.data.bookings) this.data.bookings = [];
        if (!this.data.reviews) this.data.reviews = [];
      } else {
        this.save();
      }
      this.loaded = true;
    } catch (err) {
      console.error("Failed to initialize embedded DB file:", err);
      this.loaded = true;
    }
  }

  save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to save embedded DB file:", err);
    }
  }

  getCollection(name) {
    this.init();
    if (!this.data[name]) this.data[name] = [];
    return this.data[name];
  }

  createModel(collectionName) {
    const store = this;

    class QueryPromise {
      constructor(execFn) {
        this._execFn = execFn;
        this._sortObj = null;
        this._selectFields = null;
        this._populates = [];
      }

      sort(sortObj) {
        this._sortObj = sortObj;
        return this;
      }

      select(fields) {
        this._selectFields = fields;
        return this;
      }

      populate(path, select) {
        this._populates.push({ path, select });
        return this;
      }

      async exec() {
        let result = await this._execFn();
        if (Array.isArray(result)) {
          if (this._sortObj) {
            const [key, order] = Object.entries(this._sortObj)[0] || [];
            if (key) {
              result.sort((a, b) => {
                const valA = a[key] ?? 0;
                const valB = b[key] ?? 0;
                if (valA < valB) return order === -1 ? 1 : -1;
                if (valA > valB) return order === -1 ? -1 : 1;
                return 0;
              });
            }
          }
          if (this._populates.length) {
            for (const pop of this._populates) {
              result = result.map(item => store.populateDoc(item, pop.path, pop.select));
            }
          }
          if (this._selectFields) {
            result = result.map(item => store.applySelect(item, this._selectFields));
          }
        } else if (result && typeof result === "object") {
          if (this._populates.length) {
            for (const pop of this._populates) {
              result = store.populateDoc(result, pop.path, pop.select);
            }
          }
          if (this._selectFields) {
            result = store.applySelect(result, this._selectFields);
          }
        }
        return result;
      }

      then(resolve, reject) {
        return this.exec().then(resolve, reject);
      }

      catch(reject) {
        return this.exec().catch(reject);
      }
    }

    return {
      name: collectionName,

      find(filter = {}) {
        return new QueryPromise(() => {
          const list = store.getCollection(collectionName);
          const matched = list.filter(item => store.matchFilter(item, filter));
          return JSON.parse(JSON.stringify(matched));
        });
      },

      findOne(filter = {}) {
        return new QueryPromise(() => {
          const list = store.getCollection(collectionName);
          const item = list.find(it => store.matchFilter(it, filter));
          return item ? JSON.parse(JSON.stringify(item)) : null;
        });
      },

      findById(id) {
        return new QueryPromise(() => {
          const list = store.getCollection(collectionName);
          const item = list.find(it => String(it._id) === String(id));
          return item ? JSON.parse(JSON.stringify(item)) : null;
        });
      },

      async exists(filter = {}) {
        const list = store.getCollection(collectionName);
        const found = list.some(it => store.matchFilter(it, filter));
        return found ? { _id: true } : null;
      },

      async countDocuments(filter = {}) {
        const list = store.getCollection(collectionName);
        if (!filter || Object.keys(filter).length === 0) return list.length;
        return list.filter(it => store.matchFilter(it, filter)).length;
      },

      async create(doc) {
        const list = store.getCollection(collectionName);
        const now = new Date().toISOString();
        const newDoc = {
          _id: doc._id || makeId(),
          ...doc,
          createdAt: doc.createdAt || now,
          updatedAt: doc.updatedAt || now
        };
        list.push(newDoc);
        store.save();

        const created = JSON.parse(JSON.stringify(newDoc));
        created.populate = async function(path, select) {
          return store.populateDoc(this, path, select);
        };
        return created;
      },

      findByIdAndUpdate(id, update, options = {}) {
        return new QueryPromise(() => {
          const list = store.getCollection(collectionName);
          const index = list.findIndex(it => String(it._id) === String(id));
          if (index === -1) return null;
          const now = new Date().toISOString();
          const current = list[index];
          const updated = {
            ...current,
            ...update,
            updatedAt: now
          };
          list[index] = updated;
          store.save();
          return JSON.parse(JSON.stringify(updated));
        });
      },

      async findOneAndUpdate(filter, update, options = {}) {
        const list = store.getCollection(collectionName);
        let index = list.findIndex(it => store.matchFilter(it, filter));
        const now = new Date().toISOString();
        if (index === -1) {
          if (options.upsert) {
            const newDoc = {
              _id: update._id || makeId(),
              ...update,
              createdAt: now,
              updatedAt: now
            };
            list.push(newDoc);
            store.save();
            return JSON.parse(JSON.stringify(newDoc));
          }
          return null;
        }
        const current = list[index];
        const updated = {
          ...current,
          ...update,
          updatedAt: now
        };
        list[index] = updated;
        store.save();
        return JSON.parse(JSON.stringify(updated));
      },

      async findByIdAndDelete(id) {
        const list = store.getCollection(collectionName);
        const index = list.findIndex(it => String(it._id) === String(id));
        if (index === -1) return null;
        const [removed] = list.splice(index, 1);
        store.save();
        return removed;
      },

      async aggregate(pipeline = []) {
        let list = JSON.parse(JSON.stringify(store.getCollection(collectionName)));
        for (const stage of pipeline) {
          if (stage.$match) {
            list = list.filter(item => store.matchFilter(item, stage.$match));
          } else if (stage.$group) {
            const groupKey = stage.$group._id;
            const groups = new Map();
            for (const item of list) {
              const val = groupKey ? (groupKey.startsWith("$") ? item[groupKey.slice(1)] : item[groupKey]) : null;
              const gKey = val === null || val === undefined ? "_all" : String(val);
              if (!groups.has(gKey)) groups.set(gKey, { key: val, items: [] });
              groups.get(gKey).items.push(item);
            }
            const groupedResults = [];
            for (const [, grp] of groups) {
              const res = { _id: grp.key };
              for (const [outKey, aggOp] of Object.entries(stage.$group)) {
                if (outKey === "_id") continue;
                if (aggOp.$sum) {
                  if (aggOp.$sum === 1) {
                    res[outKey] = grp.items.length;
                  } else if (typeof aggOp.$sum === "string" && aggOp.$sum.startsWith("$")) {
                    const field = aggOp.$sum.slice(1);
                    res[outKey] = grp.items.reduce((s, it) => s + (Number(it[field]) || 0), 0);
                  }
                }
              }
              groupedResults.push(res);
            }
            list = groupedResults;
          }
        }
        return list;
      }
    };
  }

  populateDoc(doc, field, select = "") {
    if (!doc || !doc[field]) return doc;
    const refId = typeof doc[field] === "object" && doc[field]._id ? doc[field]._id : doc[field];
    let targetColl = "";
    if (field === "user") targetColl = "users";
    else if (field === "room") targetColl = "rooms";
    else if (field === "booking") targetColl = "bookings";

    if (!targetColl) return doc;
    const target = this.getCollection(targetColl).find(it => String(it._id) === String(refId));
    if (target) {
      let populated = JSON.parse(JSON.stringify(target));
      if (select) {
        populated = this.applySelect(populated, select);
      }
      return { ...doc, [field]: populated };
    }
    return doc;
  }

  applySelect(item, selectStr) {
    if (!item || !selectStr) return item;
    const fields = selectStr.split(/\s+/).filter(Boolean);
    const cloned = { ...item };

    const includesPlus = fields.some(f => f.startsWith("+"));
    const includesMinus = fields.some(f => f.startsWith("-"));

    if (includesPlus) {
      return cloned;
    }

    if (includesMinus) {
      for (const f of fields) {
        if (f.startsWith("-")) delete cloned[f.slice(1)];
      }
      return cloned;
    }

    const result = { _id: item._id };
    for (const f of fields) {
      if (f in item) result[f] = item[f];
    }
    return result;
  }

  matchFilter(item, filter) {
    if (!filter || Object.keys(filter).length === 0) return true;
    for (const [key, expected] of Object.entries(filter)) {
      if (key === "$or" && Array.isArray(expected)) {
        const matchesAny = expected.some(subFilter => this.matchFilter(item, subFilter));
        if (!matchesAny) return false;
        continue;
      }
      if (key === "$and" && Array.isArray(expected)) {
        const matchesAll = expected.every(subFilter => this.matchFilter(item, subFilter));
        if (!matchesAll) return false;
        continue;
      }

      const itemVal = item[key];
      if (expected && typeof expected === "object") {
        if (expected.$regex) {
          const flags = expected.$options || "i";
          const re = new RegExp(expected.$regex, flags);
          if (!re.test(String(itemVal || ""))) return false;
          continue;
        }
        if (expected.$in && Array.isArray(expected.$in)) {
          if (!expected.$in.map(String).includes(String(itemVal))) return false;
          continue;
        }
        if (expected.$ne !== undefined) {
          if (String(itemVal) === String(expected.$ne)) return false;
          continue;
        }
        if (expected.$gte !== undefined && (itemVal < expected.$gte || itemVal === undefined)) return false;
        if (expected.$lte !== undefined && (itemVal > expected.$lte || itemVal === undefined)) return false;
        if (expected.$gt !== undefined && (new Date(itemVal) <= new Date(expected.$gt) || itemVal <= expected.$gt)) return false;
        if (expected.$lt !== undefined && (new Date(itemVal) >= new Date(expected.$lt) || itemVal >= expected.$lt)) return false;
        continue;
      }

      if (String(itemVal) !== String(expected)) return false;
    }
    return true;
  }
}

export const embeddedStore = new EmbeddedStore();
