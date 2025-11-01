// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');  // dùng để băm (hash) mật khẩu
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// ===================== CONFIG =====================
const JWT_SECRET = 'my_secret_key_123';
const JWT_EXPIRES_IN = '1h';
const SALT_ROUNDS = 12;

// ===================== REGISTRATION =====================
router.post('/registration', async (req, res) => {
    const { name, email, password } = req.body;

    // 400: thiếu dữ liệu
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Thiếu name, email hoặc password' });
    }

    try {
        // Băm mật khẩu trước khi lưu
        const hash = await bcrypt.hash(password, SALT_ROUNDS);

        const user = await User.create({
            name,
            email,          // nhớ set lowercase+trim trong schema
            password: hash  // lưu HASH, không lưu plaintext
        });

        // 201: Created
        return res.status(201).json({
            message: 'Đăng ký thành công',
            userId: user._id.toString(),
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        });

    } catch (err) {
        // 409: email trùng (do unique index)
        //11000 là mã lỗi của MongoDB à vi phạm ràng buộc unique: bạn 
        // đang cố chèn/khởi tạo một document có giá trị trùng với một document đã có trên trường được đánh unique
        if (err && err.code === 11000) {
            return res.status(409).json({ message: 'Email đã tồn tại' });
        }
        console.error(err); //In lỗi ra console cho dev xem
        return res.status(500).json({ message: 'Lỗi server' });
    }
});

// ===================== LOGIN =====================
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // 1) Thiếu dữ liệu -> 400
    if (!email || !password) {
        return res.status(400).json({ message: 'Thiếu email hoặc password' });
    }

    try {
        // 2) Chuẩn hoá email giống schema
        const normalizedEmail = email.trim().toLowerCase();

        // 3) Tìm user theo email (NHỚ bật lấy password vì schema có select:false)
        //select('+password') rất quan trọng: vì trong schema mình ẩn password, nên phải xin lấy ra để so sánh.
        //Tìm user theo email trong MongoDB.
        //findOne() là phương thức (method) của Mongoose Model. Nó dùng để tìm ra một document (1 bản ghi) trong collection thỏa điều kiện.
        //Tìm trong database xem có user nào có email trùng với email mà client gửi lên hay không.
        const user = await User.findOne({ email: normalizedEmail }).select('+password');

        // 4) Không thấy user -> 401
        if (!user) {
            return res.status(401).json({ message: 'Sai email hoặc mật khẩu' });
        }

        // 5) So khớp password: so sánh password thô với hash trong DB
        const ok = await bcrypt.compare(password, user.password);
        //password: là mật khẩu người dùng vừa gõ trên form (dạng bình thường).
        //user.password: là mật khẩu dạng hash đang lưu trong database.
        //bcrypt.compare() tự hash mật khẩu người dùng nhập, rồi so sánh với hash đã lưu.
        //bcrypt.compare() sẽ so sánh 2 cái này xem có khớp không (nó sẽ hash lại cái anh vừa nhập rồi đối chiếu với cái lưu trong DB).
        if (!ok) {
            return res.status(401).json({ message: 'Sai email hoặc mật khẩu' });
        }


        // ✅ Nếu password đúng → tạo JWT token
        const payload = {
            id: user._id.toString(),
            name: user.name,
            email: user.email
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        //jwt.sign() Hàm của thư viện jsonwebtoken – dùng để “ký tên” tạo ra token (thẻ xác nhận).
        //payload Là thông tin muốn nhét vào token
        //JWT_SECRET Là chìa khóa bí mật dùng để ký token.→ Chỉ server biết, giúp người khác không thể giả mạo thẻ.
        //{ expiresIn: JWT_EXPIRES_IN } Là thời hạn sử dụng token 

        // 6) Thành công -> 200 (KHÔNG trả password/hash)
        return res.status(200).json({
            message: 'Đăng nhập thành công',
            token,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Lỗi server' });
    }
});
module.exports = router;
