const { MongoClient } = require("mongodb");
require("dotenv").config();

const dbName = process.env.DB_NAME;
const collName = process.env.COLL_NAME;
const client = new MongoClient(process.env.CONNECTION_STRING);

const dbInstance = client.db(dbName).collection(collName);

const dbSchema = {
  $jsonSchema: {
    bsonType: "object",
    title: "courseCategories collection validation",
    required: ["name"],
    properties: {
      name: {
        bsonType: "string",
        minLength: 3,
      },
    },
  },
};

async function connectMongo(res) {
  try {
    await client.connect();
    res.send("Mongo atlas connected.");
  } catch (err) {
    res.status(400).send("client connection error");
  }
}

async function closeConnection() {
  await client.close();
}

async function createCollection(databaseName, collectionName) {
  try {
    await connectMongo();
    client.db(databaseName).createCollection(collectionName, {
      validator: dbSchema,
      validationAction: "error",
      validationLevel: "strict",
      collation: { locale: "en_US", strength: 2 }, //case insentive
    });
  } catch (err) {
    return err;
  }
}

async function createIndexes(indexFields, dbInstance, ...options) {
  try {
    await connectMongo();
    await dbInstance.createIndex(indexFields, ...options);
  } catch (err) {
    return err;
  } finally {
    await client.close();
    console.log("client closed");
  }
}

async function getAllDocuments(res) {
  try {
    // await connectMongo();
    const categories = await dbInstance.find({}).toArray();
    res.send(categories);
  } catch (err) {
    res.status(400).send(`Bad request:${JSON.stringify(err.errmsg)}`);
  } finally {
    // await client.close();
    // console.log("client closed");
  }
}

async function getDocumentByName(req, res) {
  try {
    // await connectMongo();
    const filter = { name: req.params.name };
    const category = await dbInstance.findOne(filter, {
      collation: { locale: "en_US", strength: 2 },
    });

    if (!category) {
      res.status(400).send(`${req.params.name} not found in database`);
      return;
    }
    res.send(category);
  } catch (err) {
    res.status(400).send(`Bad request:${JSON.stringify(err)}`);
  } finally {
    // await client.close();
    // console.log("client closed");
  }
}

async function storeInDb(res, newCat) {
  try {
    // await connectMongo();
    await dbInstance.insertOne(newCat);
    res.send(`success:${JSON.stringify(newCat)}`);
  } catch (err) {
    console.error(err);
    res.status(400).send(`Bad request:${JSON.stringify(err)}`);
  } finally {
    // await client.close();
    // console.log("client closed");
  }
}

async function updateCategory(req, res) {
  try {
    // await connectMongo();
    const category = await dbInstance.findOneAndUpdate(
      { name: req.params.name },
      { $set: { name: req.body.name } },
      { returnDocument: "after", collation: { locale: "en_US", strength: 2 } }
    );
    if (!category) {
      res.status(400).send(`${req.params.name} not found in database`);
      return;
    }
    res.send(`updated category as ${JSON.stringify(category)}`);
  } catch (err) {
    res
      .status(400)
      .send(`category is not found in categories. ${JSON.stringify(err)}`);
  } finally {
    // await client.close();
    // console.log("client closed");
  }
}

async function deleteCategory(req, res) {
  try {
    // await connectMongo();
    const category = await dbInstance.findOneAndDelete(
      {
        name: req.params.name,
      },
      { collation: { locale: "en_US", strength: 2 } }
    );
    res.send(`deleted category ${JSON.stringify(category)}`);
  } catch (err) {
    res
      .status(400)
      .send(`category is not found in categories. ${JSON.stringify(err)}`);
  } finally {
    // await client.close();
    // console.log("client closed");
  }
}

// rename exports in future
module.exports = {
  connectMongo: connectMongo,
  createCollection: createCollection,
  createIndexes: createIndexes,
  getAllDocuments: getAllDocuments,
  getDocumentByName: getDocumentByName,
  storeInDb: storeInDb,
  updateCategory: updateCategory,
  deleteCategory: deleteCategory,
  closeConnection: closeConnection,
};
