const mongoose = require('mongoose');
// ===== USER MODEL =====
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false }
}, { timestamps: true }); // tự động thêm createdAt, updatedAt

// const User = mongoose.model('User', userSchema); -> k sài đc nữa
module.exports = mongoose.model('User', userSchema);

