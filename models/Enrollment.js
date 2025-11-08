// models/Enrollment.js
const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, //Ai là người tham gia lớp (liên kết tới bảng User)
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true, index: true }, //Lớp nào mà người đó tham gia (liên kết tới bảng Class)
    role: { type: String, enum: ['student', 'ta', 'teacher'], default: 'student' },
    //Vai trò của người đó trong lớp: "student" (học sinh), "ta" (trợ giảng), "teacher" (giảng viên). Mặc định là "student"
    //enum Chỉ cho phép giá trị của trường này nằm trong danh sách cố định.
    joinedAt: { type: Date, default: Date.now }, //Ngày người này tham gia lớp. Mặc định = thời điểm tạo record
    status: { type: String, enum: ['active', 'dropped', 'completed'], default: 'active' }
    //Trạng thái tham gia: "active" (đang học), "dropped" (bỏ học), "completed" (đã hoàn thành). Mặc định = "active"
}, { timestamps: true }); //Tự động thêm createdAt và updatedAt cho mỗi lần tạo hoặc sửa dữ liệu

EnrollmentSchema.index({ user: 1, class: 1 }, { unique: true }); // 1 user không đăng ký trùng 1 class
//Một user không thể đăng ký cùng một class hai lần.
//Một user chỉ được đăng ký 1 lần duy nhất cho cùng 1 class

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
