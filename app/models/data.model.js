const mongoose = require("mongoose");

const Data = mongoose.model(
  "Data",
  new mongoose.Schema({
    inst: Object
  })
);

module.exports = Data;