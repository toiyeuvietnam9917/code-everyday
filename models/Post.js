// ===================== KẾT NỐI MONGODB =====================
const mongoose = require('mongoose');
// require('mongoose') → là “gọi thư viện” để Node.js hiểu cách làm việc với MongoDB.
// ===================== TẠO SCHEMA & MODEL =====================
// 🧱 1. Tạo Schema (khuôn dữ liệu) - Định nghĩa cấu trúc dữ liệu bài viết (post)
const postSchema = new mongoose.Schema({
    title: { type: String, required: true },    // bắt buộc có title (chuỗi)
    content: { type: String, required: true }   // bắt buộc có content (chuỗi)
}, { timestamps: true }); // tự động thêm createdAt, updatedAt
// 🟢 Thêm index cho title
postSchema.index({ title: 1 }); // 1 = sắp xếp tăng dần (A → Z). -1 = sắp xếp giảm dần (Z → A).
//  “Ê MongoDB, mày tạo cho tao một cái mục lục sắp xếp theo title nhé — từ A → Z.”
// 2. Tạo Model - đại diện cho collection "posts"
// const Post = mongoose.model('Post', postSchema); -> ko sài đc nữa
//Tên Model nên viết hoa chữ cái đầu, vì nó là “class” (lớp đối tượng) đại diện cho 1 loại dữ liệu.
//Post không phải là 1 bài viết duy nhất. Nó là “khuôn” để tạo ra nhiều bài viết. (giống như class Student → tạo ra nhiều student)
//mongoose.model(...) mongoose.model nghĩa là: “Ê Mongoose, tạo cho tao một cái bảng (collection) mới trong MongoDB nhé!”ư
module.exports = mongoose.model('Post', postSchema);
