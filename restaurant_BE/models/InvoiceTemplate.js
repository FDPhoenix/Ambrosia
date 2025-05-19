const mongoose = require("mongoose");

const InvoiceTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true}, // tên mẫu
  fields: [{ type: String }], // các trường được chọn
});

module.exports = mongoose.model("InvoiceTemplate", InvoiceTemplateSchema);
