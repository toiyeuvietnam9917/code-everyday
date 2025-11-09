// routes/classRoutes.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Class = require('../models/Class');
const Enrollment = require('../models/Enrollment');
const { requireAuth } = require('../middleware/auth');

// routes/classRoutes.js (rút gọn)
// router.post('/', requireAuth, async (req, res) => {
//     const { name, description } = req.body;
//     if (!name) return res.status(400).json({ error: 'name là bắt buộc' });

//     const clazz = await Class.create({
//         name: name.trim(),
//         description: description?.trim(),
//         createdBy: req.user.id
//     });

//     res.status(201).json({ message: 'Tạo lớp thành công', class: clazz });
// });


/* ===================== CREATE (PUBLIC) ===================== */
// POST /api/classes
router.post('/', async (req, res) => {
    try {
        let { name, description, createdBy } = req.body ?? {};
        //?? {} đảm bảo nếu body rỗng thì vẫn có object trống (tránh crash).
        //req.body ?? {}: nullish coalescing – nếu req.body là null/undefined 
        //(client gửi sai header/không có body), ta dùng {} để không crash khi destructuring.
        if (!name || typeof name !== 'string' || !name.trim()) {
            //Kiểm tra name có tồn tại và là chuỗi hợp lệ không.
            //!name.trim() Nghĩa là: chuỗi trống sau khi xóa khoảng trắng. //Không được chỉ toàn khoảng trắng
            return res.status(400).json({ error: 'name là bắt buộc' });
        }
        name = name.trim();
        const payload = { name: name }; //Khi tên key và tên biến giống nhau, bạn có thể viết gọn { name }
        if (typeof description === 'string' && description.trim()) {
            //&& chỉ kiểm tra vế phải nếu vế trái đúng.
            //description.trim() luôn trả về chuỗi, nhưng chuỗi đó có thể rỗng nếu ban đầu chỉ có khoảng trắng. 
            // Trong if (description.trim()), → Nếu chuỗi rỗng thì điều kiện sai → Nếu chuỗi có ký tự thì điều kiện đúng    
            payload.description = description.trim(); //thêm key mới (description) vào object payload
        }
        // createdBy là tùy chọn; nếu có thì phải là ObjectId hợp lệ
        if (createdBy !== undefined) {
            //Chỉ chạy khối code bên trong nếu biến createdBy thực sự tồn tại
            //tức là người dùng có gửi trường createdBy trong request
            if (createdBy && !mongoose.isValidObjectId(createdBy)) {
                //Nếu biến createdBy có giá trị và giá trị đó không phải là một ObjectId hợp lệ của MongoDB,thì điều kiện này đúng.”
                //mongoose.isValidObjectId(createdBy) hàm kiểm tra hợp lệ của Mongoose xác định xem một chuỗi có đúng định dạng ObjectId của MongoDB hay không.
                return res.status(400).json({ error: 'createdBy không hợp lệ' });
            }
            payload.createdBy = createdBy || null;
            //Gán cho payload.createdBy giá trị của createdBy, còn nếu createdBy là falsy (ví dụ '', null, 0, false), thì gán null.”
        }

        const clazz = await Class.create(payload);
        return res.status(201).json({ message: 'Tạo lớp học thành công', class: clazz });
    } catch (err) {
        console.error('Create class error:', err);
        return res.status(500).json({ error: 'Lỗi server' });
    }
});

/* ===================== READ ALL (PUBLIC) ===================== */
// GET /api/classes?search=&page=&limit=
router.get('/', async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;
        const { search } = req.query;

        const filter = search ? { name: { $regex: search, $options: 'i' } } : {};
        //➡️ Nếu có từ khóa tìm kiếm (search): Tạo một bộ lọc (filter) để tìm trong trường name 
        // Dùng $regex = tìm gần đúng (giống “tìm chứa từ khóa”) $options: 'i' = không phân biệt chữ hoa/thường 
        // Nếu không có từ khóa thì filter = {} (lấy tất cả).
        const total = await Class.countDocuments(filter);
        const totalPages = Math.max(Math.ceil(total / limit), 1);

        const classes = await Class.find(filter) //Tìm các lớp thỏa điều kiện filter (hoặc tất cả nếu filter = {}
            .sort({ createdAt: -1 }) //Sắp xếp theo thời gian tạo mới nhất (mới ở trên, cũ ở dưới)
            .skip(skip)
            .limit(limit)
            .populate('createdBy', 'name email');
        //Lấy thêm thông tin người tạo lớp (trong bảng User),nhưng chỉ lấy 2 trường name và email
        //.populate() dùng để tự động lấy dữ liệu chi tiết từ một bảng khác(collection khác), thay vì chỉ trả về ID thôi.
        return res.status(200).json({
            page, limit, total, totalPages, //Trong object { ... }, nếu tên biến và tên key trùng nhau, thì JavaScript cho phép viết tắt chỉ cần ghi tên biến một lần.
            hasPrev: page > 1,
            hasNext: page < totalPages,
            results: classes
        });
    } catch (err) {
        console.error('List classes error:', err);
        return res.status(500).json({ error: 'Lỗi server' });
    }
});

/* ===================== READ ONE (PUBLIC) ===================== */
// GET /api/classes/:id
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ error: 'ID không hợp lệ' });
    }
    try {
        const clazz = await Class.findById(id).populate('createdBy', 'name email');
        //Dùng Class.findById(id) để tìm lớp học trong database theo ID.
        //.populate('createdBy', 'name email') có nghĩa là: Lấy thêm thông tin người tạo lớp (từ bảng User) 
        // Nhưng chỉ lấy 2 trường name và email cho gọn, không lấy hết.
        if (!clazz) return res.status(404).json({ error: 'Không tìm thấy lớp học', id });
        return res.status(200).json({ message: 'Lấy lớp học thành công', class: clazz });
    } catch (err) {
        console.error('Get class error:', err);
        return res.status(500).json({ error: 'Lỗi server' });
    }
});

/* ===================== UPDATE (PUBLIC) ===================== */
// PUT /api/classes/:id
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ error: 'ID không hợp lệ' });
    }
    try {
        let { name, description, createdBy, ...rest } = req.body ?? {};
        //Dấu ...rest gom tất cả field lạ (ngoài 3 cái trên) vào biến rest để kiểm tra sau.
        const $set = {}; //$set mặc định của mongo
        //MongoDB khi cập nhật thường dùng cú pháp $set để “chỉ sửa những trường có trong đây”.
        if (typeof name === 'string' && name.trim()) $set.name = name.trim();
        //Nếu name là chuỗi và không rỗng → thêm vào $set.
        if (typeof description === 'string') $set.description = description.trim();
        //Nếu description là chuỗi (có thể rỗng) → thêm vào $set (vì có thể muốn xóa mô tả).

        if (createdBy !== undefined) {
            if (createdBy && !mongoose.isValidObjectId(createdBy)) {
                return res.status(400).json({ error: 'createdBy không hợp lệ' });
            }
            $set.createdBy = createdBy || null;
            // ➡️ Nếu có giá trị hợp lệ thì gán nó vào, nếu gửi "" hoặc null → gán null luôn (cho phép “xoá người tạo”).
        }

        // if (Object.keys(rest).length) {
        //     // có field lạ -> bỏ qua (hoặc bạn có thể chặn nếu muốn)
        //     //Object.keys(rest) trả về danh sách các key còn lại mà bạn không mong muốn (sau khi tách các field hợp lệ ra).
        //     //Nếu rest có key → Object.keys(rest).length > 0 → chạy vào if.
        //     //Nếu rest rỗng → Object.keys(rest).length === 0 → không chạy vào if, tức là bỏ qua, không làm gì cả.
        // }
        if (Object.keys($set).length === 0) {
            return res.status(400).json({ error: 'Không có trường hợp lệ để cập nhật' });
        }
        //Object.keys($set) sẽ trả về một mảng chứa tất cả các tên trường (key) mà bạn định cập nhật trong MongoDB.
        //Object.keys($set).length === 0 nghĩa là: “Không có trường nào hợp lệ để cập nhật cả” (mảng rỗng).

        const updated = await Class.findByIdAndUpdate(
            id,
            { $set },
            { new: true, runValidators: true, context: 'query' }
            //new: true → trả về document sau khi đã cập nhật (nếu bỏ, mặc định trả về bản cũ trước khi cập nhật).
            //runValidators: true → bật validate khi update (mặc định update không chạy validator). Validator sẽ kiểm tra các path bạn cập nhật.
            //context: 'query' → để các validator / middleware hiểu đây là ngữ cảnh query-update (nhiều custom validator dùng this sẽ dựa vào context này)
        ).populate('createdBy', 'name email');

        if (!updated) return res.status(404).json({ error: 'Không tìm thấy lớp học', id });
        return res.status(200).json({ message: 'Cập nhật lớp học thành công', class: updated });
    } catch (err) {
        console.error('Update class error:', err);
        if (err.name === 'ValidationError') {
            return res.status(422).json({ error: 'Dữ liệu không hợp lệ', details: err.errors });
        }//Nếu lỗi kiểu validation (dữ liệu sai quy tắc) → trả 422 Unprocessable Entity.
        return res.status(500).json({ error: 'Lỗi server' });
    }
});

/* ===================== DELETE (PUBLIC) ===================== */
// DELETE /api/classes/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ error: 'ID không hợp lệ' });
    }
    try {
        const deleted = await Class.findByIdAndDelete(id).populate('createdBy', 'name email');
        //nếu lớp có trường createdBy, nó sẽ lấy thêm thông tin của người tạo (chỉ gồm name và email).
        //Trả về document đã xoá hoặc null

        if (!deleted) return res.status(404).json({ error: 'Không tìm thấy lớp học', id });
        return res.status(200).json({ message: 'Đã xóa lớp học thành công', deletedClass: deleted });
    } catch (err) {
        console.error('Delete class error:', err);
        return res.status(500).json({ error: 'Lỗi server' });
    }
});

/* ===================== JOIN CLASS (PRIVATE) ===================== */
// POST /api/classes/:classId/join
router.post('/:classId/join', requireAuth, async (req, res) => {
    const { classId } = req.params;

    // 1) Validate ObjectId
    if (!mongoose.isValidObjectId(classId)) {
        return res.status(400).json({ error: 'classId không hợp lệ' });
    }

    try {
        // 2) Kiểm tra class có tồn tại không
        //Đi tìm trong bảng Class xem có lớp nào có id = classId hay không. 
        // Nếu tìm thấy thì lấy ra thông tin, còn nếu không có thì báo lỗi Không tìm thấy lớp.”
        //.findById(...) là câu lệnh tìm một bản ghi theo ID.
        //.select('_id name') Đây là chỉ lấy ra một vài trường (field), không lấy hết.
        const clazz = await Class.findById(classId).select('_id name');
        if (!clazz) return res.status(404).json({ error: 'Không tìm thấy lớp' });

        // ✅ Thêm check tối thiểu: đã là thành viên thì trả luôn
        const existed = await Enrollment.findOne({ user: req.user.id, class: classId }).select('_id').lean();
        //lean() là một tối ưu đặc biệt của Mongoose, giúp truy vấn nhanh hơn và tốn ít RAM hơn.
        //chỉ cần biết có tồn tại hay không, không cần chỉnh sửa hoặc lưu lại.
        if (existed) {
            return res.status(200).json({ message: 'Đã là thành viên lớp này' });
        }

        // 3) Upsert quan hệ user-class (không tạo trùng)
        //“Tìm trong bảng Enrollment (bảng ghi danh) xem người dùng này đã đăng ký vào lớp đó chưa.
        //Nếu chưa có thì tạo mới một bản ghi,
        //còn nếu đã có rồi thì không cần tạo lại.”
        //1️⃣ Enrollment.findOneAndUpdate(...) Tìm một bản ghi và cập nhật nó (nếu có)
        //2️⃣ { user: req.user.id, class: classId } Là điều kiện để tìm. Tìm xem user có ID là 672f2e9e... đã đăng ký lớp có ID 6738a7b3... chưa
        //Enrollment là model (bảng lưu việc ai học lớp nào). Nếu tìm thấy,nó update. Nếu ko thấy, thì với upsert: true, nó sẽ tạo mới luôn.
        const enrollment = await Enrollment.findOneAndUpdate(
            { user: req.user.id, class: classId }, //requireAuth để lấy req.user.id từ JWT.
            { $setOnInsert: { role: 'student', status: 'active', joinedAt: new Date() } },
            //$setOnInsert Là một toán tử đặc biệt chỉ hoạt động khi bạn dùng upsert: true.
            //= “chỉ chạy khi tạo mới document (khi chưa tồn tại).”
            { upsert: true, new: true }
            //upsert: true → nếu chưa có thì insert (thêm mới).
            //new: true → trả về document sau khi update hoặc tạo, không phải bản cũ.
        )
            .populate('user', 'name email')
            .populate('class', 'name description');

        return res.status(200).json({
            message: 'Đăng ký lớp thành công',
            enrollment
        });
    } catch (err) {
        // Duplicate key (trường hợp hiếm khi race-condition): đã là member
        if (err && err.code === 11000) {
            return res.status(200).json({ message: 'Đã là thành viên lớp này' });
        }
        console.error('Join class error:', err);
        return res.status(500).json({ error: 'Lỗi server' });
    }
});

module.exports = router;
