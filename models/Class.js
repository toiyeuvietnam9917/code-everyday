// models/Class.js
const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true }, //Tên lớp học (bắt buộc, không được để trống)
    description: { type: String, trim: true }, //Mô tả thêm (không bắt buộc, tự động cắt khoảng trắng thừa nhờ trim: true)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
    // PUBLIC ⇒ không required
    // ai tạo lớp 
    //ObjectId là kiểu dữ liệu đặc biệt mà MongoDB dùng để lưu khóa định danh (_id) của mỗi document.
    //Trường createdBy sẽ lưu ID của một document trong collection users.
    //Liên kết đến user đã tạo lớp. Đây là khóa ngoại tham chiếu tới bảng User (ref: 'User')
    //Liên kết với một user có trong collection users
    //Ai tạo lớp học đó (người quản lý, admin, giáo viên, v.v.)
    //Một lớp học thường chỉ có một người tạo (admin hoặc giảng viên). Người này không nhất thiết là người “viết bài” trong lớp.
}, { timestamps: true });

module.exports = mongoose.model('Class', ClassSchema);
