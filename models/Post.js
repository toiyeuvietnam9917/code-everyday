// ===================== KẾT NỐI MONGODB =====================
const mongoose = require('mongoose');
// require('mongoose') → là “gọi thư viện” để Node.js hiểu cách làm việc với MongoDB.
// ===================== TẠO SCHEMA & MODEL =====================
// 🧱 1. Tạo Schema (khuôn dữ liệu) - Định nghĩa cấu trúc dữ liệu bài viết (post)
const postSchema = new mongoose.Schema({
    title: { type: String, required: true },    // bắt buộc có title (chuỗi)
    content: { type: String, required: true },   // bắt buộc có content (chuỗi)
    author: {
        type: mongoose.Schema.Types.ObjectId, // kiểu dữ liệu ObjectId
        ref: 'User',                          // tên model được tham chiếu tới
        required: true                        // bắt buộc phải có tác giả //Ai là người viết bài đăng đó
    }
}, { timestamps: true }); // tự động thêm createdAt, updatedAt
// 🟢 Thêm index cho title
// postSchema.index({ title: 1 }); // 1 = sắp xếp tăng dần (A → Z). -1 = sắp xếp giảm dần (Z → A).
postSchema.index(
    { title: 'text', content: 'text' },
    {
        weights: { title: 10, content: 3 },
        default_language: 'none',      // Không áp dụng ngôn ngữ mặc định nào khi phân tích text
        language_override: 'language'  // Cho phép mỗi document chỉ định ngôn ngữ riêng qua field "language"
        //Nếu trong document (bản ghi) của bạn có một field tên "language", MongoDB sẽ dùng giá trị đó để biết “ngôn ngữ của document này là gì”.
    }
);
//  “Ê MongoDB, mày tạo cho tao một cái mục lục sắp xếp theo title nhé — từ A → Z.”
// 2. Tạo Model - đại diện cho collection "posts"
// const Post = mongoose.model('Post', postSchema); -> ko sài đc nữa
//Tên Model nên viết hoa chữ cái đầu, vì nó là “class” (lớp đối tượng) đại diện cho 1 loại dữ liệu.
//Post không phải là 1 bài viết duy nhất. Nó là “khuôn” để tạo ra nhiều bài viết. (giống như class Student → tạo ra nhiều student)
//mongoose.model(...) mongoose.model nghĩa là: “Ê Mongoose, tạo cho tao một cái bảng (collection) mới trong MongoDB nhé!”ư
module.exports = mongoose.model('Post', postSchema); //tạo model từ schema module.exports = Post;
//“Tôi muốn xuất ra (export) biến Post để những file khác có thể require và sử dụng nó.”

///cách 1
// const Post = mongoose.model('Post', postSchema);
// module.exports = Post;
