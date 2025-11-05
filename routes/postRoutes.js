// routes/postRoutes.js
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Post = require('../models/Post');

const router = express.Router();
//express.Router() là một lớp con của Express, cho phép bạn tạo nhóm các route (đường dẫn) 
// trong ứng dụng mà không cần tất cả dồn vào app.js

const JWT_SECRET = process.env.JWT_SECRET || 'my_secret_key_123';
//process.env Là nơi Node.js lưu biến môi trường (environment variables)
//process.env.JWT_SECRET - Biến môi trường có tên JWT_SECRET. Nếu tồn tại, lấy giá trị đó.
//“Lấy JWT_SECRET trong môi trường nếu có, còn nếu không có thì tạm dùng chuỗi 'my_secret_key_123' làm giá trị mặc định.”

/* ========== Middleware: Yêu cầu đăng nhập bằng JWT ========== */
//next  Hàm callback mà Express truyền vào, để chuyển tiếp sang middleware kế tiếp (hoặc route handler)
//Middleware trong Express giống như “trạm kiểm soát” mà mọi request (yêu cầu) phải đi qua trước khi đến “đích” (route handler).
//Sau khi làm xong, middleware sẽ gọi next() để chuyển sang “trạm kế tiếp”.
//requireAuth chính là một middleware
//Middleware = “trạm trung gian xử lý request”.
//requireAuth = middleware xác thực (authentication middleware). Nó kiểm tra token trước khi cho request đi tiếp.
function requireAuth(req, res, next) {
    // Lấy token từ header Authorization: Bearer <token>
    const authHeader = req.headers.authorization || '';
    // req.headers = tất cả header mà client gửi lên -> .authorization = lấy phần Authorization trong header.
    // Nó sẽ có dạng Authorization: authHeader = 'Bearer abc123xyz'
    // || ''Nếu không có giấy tờ này (người gửi quên mang), thì gán là chuỗi rỗng '' để không bị lỗi.
    const [scheme, token] = authHeader.split(' ');
    //.split(' ') Cắt cái chuỗi trên thành 2 phần bằng dấu cách. authHeader.split(' ')  // → ['Bearer', 'abc123xyz']
    //lấy token người dùng gửi lên và chia nó ra thành hai phần: loại (Bearer) và mã (token).4db7d86844
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({
            message: 'Unauthorized',
            reason: 'Thiếu hoặc sai định dạng Authorization header (Bearer token).'
        });
    }
    //Kiểm tra xem phần đầu của header có đúng là "Bearer" không.
    //!token là không có token (token trống hoặc k gửi lên) || là hoặc
    // !== nghĩa là "khác nhau về cả giá trị và kiểu dữ liệu". -> toán tử so sánh không bằng nghiêm ngặt

    try {
        // Xác thực token với secret của mình ⇒ biết token có phải do mình ký không
        const payload = jwt.verify(token, JWT_SECRET); // ném lỗi nếu hết hạn/không hợp lệ
        //jwt.verify() là hàm kiểm tra (xác minh) cái token mà người dùng gửi lên.
        //jwt.verify() → kiểm tra token và giải mã ra payload (thông tin người dùng trong token).
        // dùng chữ ký để kiểm tra token client gửi lên có đúng là cái mình tạo ra ko

        // Lưu user đã xác thực vào req để downstream dùng
        req.user = payload; // ví dụ: { id, name, iat, exp }
        //Lưu thông tin đã xác thực vào req.user để các handler phía sau dùng mà không phải verify lại. -> lưu thông tin user
        return next(); //return next() chấm dứt middleware đúng cách (tránh chạy tiếp các dòng sau vô tình).
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Unauthorized',
                reason: 'JWT đã hết hạn.'
            });
        }
        return res.status(401).json({
            message: 'Unauthorized',
            reason: 'JWT không hợp lệ.'
        });
    }
}


// ===================== TẠO BÀI VIẾT (POST /posts) =====================
/**
 * Chỉ người có JWT hợp lệ mới tạo được post.
 * Body: { title, content }
 * - 400: thiếu title/content
 * - 201: trả lại post vừa tạo **/
router.post('/', requireAuth, async (req, res) => {
    //async: cho phép dùng từ khóa await bên trong (để “chờ” database làm xong).
    //Khi client gửi POST request đến endpoint /api/posts/ → sẽ chạy middleware requireAuth trước để kiểm tra JWT. 
    // Nếu hợp lệ → đi tiếp vào hàm async (req, res) (route handler) để tạo bài viết.
    const { title, content } = req.body; // lấy dữ liệu từ client gửi lên
    //{ title, content } = req.body là bóc tách: tạo 2 biến title và content từ req.body. (giống: const title = req.body.title; const content = req.body.content;)
    // 1️⃣ Kiểm tra dữ liệu
    //if (!title || !content): nếu thiếu title hoặc content → báo lỗi ngay.
    //res.status(400): trả mã lỗi 400 (người dùng gửi sai dữ liệu).
    //.json({...}): gửi phản hồi dạng JSON về cho người dùng.
    if (!title || !content) {
        //return: dừng luôn ở đây, không chạy tiếp nữa (tránh lỡ tay lưu dữ liệu sai).
        return res.status(400).json({
            error: "Bad Request",
            message: "title và content là bắt buộc"
        });
    }

    //Bắt đầu khối thử. Nếu có lỗi xảy ra ở bên trong, sẽ nhảy xuống catch.
    try {
        // ✅ 2️⃣ Tạo post kèm theo user đang đăng nhập (req.user lấy từ JWT)
        const newPost = await Post.create({
            title: title.trim(),
            content: content.trim(),
            author: req.user.id  // lấy từ token đã decode Là ID của user được lấy từ bên trong JWT. author là id đang đăng nhập
            //author: req.user.id nghĩa là “lưu ID của user đang đăng nhập (lấy từ JWT token) làm tác giả bài viết.”
        });
        //Post là Model (cái “khuôn” để làm việc với collection posts trong MongoDB).
        //.create({ title, content }): tạo mới 1 document (bản ghi) trong MongoDB với 2 trường title, content.
        //await: chờ MongoDB lưu xong rồi mới gán kết quả vào newPost.
        //newPost sẽ là đối tượng vừa được lưu, có cả _id, createdAt, updatedAt…
        // ✅ 3️⃣ Trả kết quả Trả phản hồi cho client
        res.status(201).json({
            message: "Đã thêm bài viết mới!",
            post: newPost, //chính là dữ liệu vừa lưu (để người dùng biết MongoDB đã ghi gì).
            createdBy: { id: req.user.id, name: req.user.name }
        });
    } catch (err) {
        console.error('Create post error:', err);
        res.status(500).json({
            error: "Lỗi server",
            message: "Không thể tạo bài viết"
        });
    }
});

// LẤY DANH SÁCH BÀI VIẾT (GET /posts) và phân trang - getAllPost and pagination
// Thử tạo index trên cái title của Post. Sau đó thì update cái API GET /posts để hỗ trợ tìm (search) posts theo title.
router.get('/', async (req, res) => {
    try {
        //1️⃣ Đọc tham số ?page & ?limit từ query, ép số và chặn min = 1
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 5, 1);

        //2️⃣ Đọc thêm tham số ?search (nếu người dùng muốn tìm theo title)
        // req.query là object chứa các tham số query string từ URL gửi lên
        //"Tạo biến search và gán giá trị req.query.search cho nó."
        const { search } = req.query;

        //3️⃣ Tạo điều kiện lọc
        // Nếu có ?search thì filter theo title (tìm gần đúng, không phân biệt hoa thường)
        let filter = {}; //Mặc định, chưa tìm kiếm gì → lọc tất cả (filter = {}).
        //Nếu có search, ta thay điều kiện lọc để chỉ lấy các bài viết khớp với từ khóa.
        let projection = {};
        //“projection”  là chọn những cột (field) nào mình muốn lấy ra từ database.
        //let projection = {}; nghĩa là: 👉 mặc định chưa chọn gì đặc biệt, lấy tất cả các field như bình thường.
        let sort = { createdAt: -1 };
        //{ createdAt: -1 } nghĩa là sắp xếp theo ngày tạo (createdAt) giảm dần, tức là bài mới nhất nằm trên cùng.

        if (search) {
            // Full-text
            filter = { $text: { $search: search } };
            // Lấy điểm phù hợp -  Hãy tìm những bài viết có chứa từ khóa này trong tiêu đề hoặc nội dung.
            //Hãy thêm vào kết quả một trường tên score,
            //và gán cho nó giá trị meta đặc biệt 'textScore' mà MongoDB tự tạo.
            //Phần này không lọc dữ liệu mà chỉ bảo MongoDB thêm một cột phụ (score) vào kết quả,
            //để bạn biết mức độ khớp của mỗi bài viết.
            projection = { score: { $meta: 'textScore' } };
            // Sắp xếp theo độ phù hợp trước - Khi trả kết quả, nhớ gửi thêm điểm phù hợp (score) cho mỗi bài.
            sort = { score: { $meta: 'textScore' }, createdAt: -1 };
            //ưu tiên bài nào điểm khớp cao hơn (score) lên trước,rồi mới đến bài mới nhất.”
        }
        // if (search) {
        //     filter = { title: { $regex: search, $options: 'i' } };
        //     //filter = { title: { ... } } nghĩa là: Tạo điều kiện lọc cho MongoDB: “Tôi chỉ muốn tìm những bài viết có title giống với từ khóa người nhập.”
        //     //$regex: là “regular expression” — cho phép tìm gần đúng. → Nếu search = "api" → Thì sẽ tìm được "REST API", "api cơ bản", "học Api nâng cao"...
        //     //$options: 'i': nghĩa là không phân biệt chữ hoa hay thường → "API", "api", "Api" đều được coi là giống nhau.
        //     //Nếu có từ khóa search → chỉ tìm bài có title chứa từ đó. Nếu không có → lấy tất cả bài.
        //     //{ title: { $regex: search, $options: 'i' } }
        //     //Đây là một object lồng nhau (nested object) { <tên_trường>: { <toán_tử_truy_vấn>: <giá_trị> } }
        //     // <tên_trường> = title <toán_tử_truy_vấn> = $regex <giá_trị> = search
        //     // ví dụ search = ap -> Tìm tất cả các document mà trường title có chứa chữ api (không phân biệt hoa thường).
        // }; -> khi dùng $regex áp dụng cho  Single Field Index

        // 4️⃣ Đếm tổng số bài viết (phù hợp với điều kiện filter)
        const total = await Post.countDocuments(filter);
        //.countDocuments() → là method (hàm có sẵn của Mongoose) dùng để đếm số lượng document (bản ghi) hiện có trong collection.
        //await → là từ khóa của JavaScript, nghĩa là “chờ MongoDB đếm xong rồi mới gán giá trị cho total”.
        //Đoạn này lấy tổng số bài viết hiện có trong DB, gán vào biến total.

        //totalPages là tổng số trang cần có, đảm bảo ≥ 1.
        const totalPages = Math.max(Math.ceil(total / limit), 1);
        //Math	Đối tượng có sẵn trong JavaScript	Chứa các hàm toán học tiện dụng. .ceil()	
        // Method của Math	Làm tròn lên đến số nguyên gần nhất. 
        // .max()	Method của Math	Chọn giá trị lớn nhất giữa các số truyền vào.


        //5️⃣ Tính vị trí bỏ qua (skip) rồi lấy dữ liệu theo trang
        const skip = (page - 1) * limit;
        //(page - 1)	Công thức toán học	Tính xem đang ở trang số mấy.->(page − 1) = số trang cần bỏ qua trước khi hiển thị trang hiện tại.
        // limit	Phép nhân trong JS	Mỗi trang có bao nhiêu bài.
        //skip	Biến	Lưu số lượng bài cần bỏ qua.

        const posts = await Post.find(filter, projection)
            //Chính là điều kiện lọc: Nếu có search thì filter = { $text: { $search: search } }, 
            // còn nếu không có search thì filter = {} (nghĩa là lấy tất cả).
            //Cú pháp tổng quát của .find() trong Mongoose là: Model.find(điều_kiện_lọc, lựa_chọn_field, options)
            //Post là model đại diện cho collection posts.\
            //.find() là hàm của Mongoose để tìm các document (nhiều dòng) trong MongoDB.
            //Là phần chọn những field nào muốn lấy từ DB. Bình thường: {} → lấy tất cả. Nếu đang search full-text: { score: { $meta: 'textScore' } }
            // → tức là: “Lấy tất cả các field mặc định, và thêm field score là điểm độ khớp.”
            //projection Chọn field nào hiển thị trong kết quả — ở đây là “hãy hiển thị thêm score = textScore”
            .sort(sort) // mới nhất lên đầu
            .skip(skip) //→ bỏ qua một số dòng đầu (cho phân trang) .find() là hàm của Mongoose để tìm các document (nhiều dòng) trong MongoDB.
            .limit(limit); //→ chỉ lấy một số lượng giới hạn (ví dụ 5 bài/trang)

        // 4) Trả kết quả + metadata phân trang
        return res.json({
            page,
            limit,
            total,
            totalPages,
            hasPrev: page > 1,
            hasNext: page < totalPages,
            results: posts
        });
    } catch (err) {
        console.error('List posts error:', errerr);
        res.status(500).json({ error: 'Lỗi server khi lấy danh sách bài viết' });
    }
});

// Thêm 1 cái api GET /posts/{id} tìm và chỉ trả về 1 post duy nhất sau khi tìm kiếm trong cái mảng mình có ở trên.
// GET /posts/:id - trả về 1 bài viết
// req.params là một object chứa tất cả các tham số route (route parameters) được khai báo với : trong đường dẫn.

/* ===================== GET: /posts/:id (YÊU CẦU JWT) ===================== */
router.get('/:id', requireAuth, async (req, res) => {
    const { id } = req.params;

    // 1️⃣ Kiểm tra ID hợp lệ
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ error: 'ID không hợp lệ' });
    }

    try {
        // 2️⃣ Tìm bài viết theo ID
        const post = await Post.findById(id);

        // 3️⃣ Nếu không có bài viết nào trùng ID → trả 404
        if (!post) {
            return res.status(404).json({ error: 'Không tìm thấy bài viết', id });
        }

        // 4️⃣ Thành công → trả dữ liệu
        return res.status(200).json({
            message: 'Lấy bài viết thành công',
            post,
            viewedBy: { id: req.user?.id, name: req.user?.name }
        });
    } catch (err) {
        console.error('Get post error:', err);
        return res.status(500).json({
            error: 'Lỗi server',
            message: 'Không thể lấy bài viết'
        });
    }
});



// PUT /posts/:id - Cập nhật bài viết gửi lên {title: string, content: string} 

// router.put('/:id', (req, res) => {
//     const { id } = req.params;            // Lấy giá trị id từ đường dẫn URL, ví dụ /posts/2.
//     const { title, content } = req.body;  // Lấy dữ liệu mới từ body request (title, content) ( từ client gửi lên)

//     // ✅ Kiểm tra dữ liệu gửi lên   // 1) Validate sớm – cắt rác trước khi chạm dữ liệu
//     if (!title || !content) {
//         return res.status(400).json({
//             error: "Thiếu dữ liệu",
//             message: "title và content là bắt buộc"
//         });
//     }

//     // ✅ Tìm bài viết theo id
//     const index = posts.findIndex(p => p.id === id);
//     // findIndex() sẽ duyệt mảng từ đầu đến cuối. Tìm vị trí bài viết cần sửa trong mảng. Nếu không thấy → trả lỗi 404.
//     //Dòng này có nhiệm vụ tìm xem bài viết nào trong mảng posts có id trùng với id mà client gửi lên (qua URL), và lấy vị trí (index) của bài viết đó trong mảng.

//     if (index === -1) {
//         return res.status(404).json({
//             error: "Không tìm thấy bài viết",
//             id: id
//         });
//     }

//     // ✅ Cập nhật bài viết 
//     // Không phải là khai báo lại. ✅ Mà chỉ là thay đổi phần tử bên trong mảng hiện có.
//     //cập nhật (thay đổi) bài viết cũ trong mảng posts → bằng cách giữ nguyên các thuộc tính cũ, và ghi đè lại các thuộc tính mới (title, content) mà client gửi lên.
//     //posts[index] Là phần tử cần cập nhật trong mảng.
//     //Ý nghĩa tổng thể: Tạo ra một object mới, sao chép toàn bộ dữ liệu cũ từ posts[index], rồi ghi đè lại hai trường title và content bằng giá trị mới (client gửi lên).
//     // ...posts[index] = copy toàn bộ các cặp key–value của bài viết cũ
//     // posts[index] = { id: "2", title: "Cũ", content: "Cũ" }; -> ...posts[index] tương đương với: id: "2", title: "Cũ", content: "Cũ"
//     posts[index] = { ...posts[index], title, content };

//     // ✅ Trả về kết quả
//     res.status(200).json({
//         message1: "Cập nhật bài viết thành công",
//         post: posts[index]
//     });
// });


/* ===================== UPDATE: PUT /posts/:id (YÊU CẦU JWT) ===================== */
router.put('/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    // 1️⃣ Kiểm tra ID hợp lệ
    //Hàm mongoose.isValidObjectId(id) dùng để kiểm tra xem chuỗi id mà client gửi lên có đúng định dạng của MongoDB ObjectId không.
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ error: 'ID không hợp lệ' });
    }

    // 2️⃣ Kiểm tra dữ liệu đầu vào
    if (!title || !content) {
        return res.status(400).json({ error: 'Thiếu dữ liệu', message: 'title và content là bắt buộc' });
    }

    try {
        // 3️⃣ Cập nhật trực tiếp (atomic & 1 query duy nhất)
        const updated = await Post.findByIdAndUpdate(
            //nó làm 2 việc cùng lúc: Tìm document có _id = id 
            // Nếu có, thì cập nhật các field bạn truyền vào (title, content) và trả về document sau khi sửa.
            //nếu không có document nào trùng ID thì sao? 👉 MongoDB không cập nhật gì cả — và findByIdAndUpdate() sẽ trả về null.
            id,  // id bài viết muốn sửa (lấy từ URL)
            { title: title.trim(), content: content.trim() },  // dữ liệu mới
            { new: true, runValidators: true } // trả về bản cập nhật mới nhất new: true → trả về bản đã cập nhật, không phải bản cũ
        );

        // 4️⃣ Nếu không có document nào trùng ID → null → 404
        if (!updated) {
            return res.status(404).json({ error: 'Không tìm thấy bài viết', id });
        }

        // 5️⃣ Thành công → trả kết quả
        return res.status(200).json({
            message: 'Cập nhật bài viết thành công',
            post: updated,
            updatedBy: { id: req.user?.id, name: req.user?.name } //?. là optional chaining → để tránh lỗi nếu req.user chưa tồn tại.
        });
    } catch (err) {
        console.error('Update post error:', err);
        return res.status(500).json({
            error: 'Lỗi server',
            message: 'Không thể cập nhật bài viết'
        });
    }
});


/* ===================== DELETE: DELETE /posts/:id (YÊU CẦU JWT) ===================== */
router.delete('/:id', requireAuth, async (req, res) => {
    const { id } = req.params;

    // 1️⃣ Kiểm tra ID hợp lệ
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ error: 'ID không hợp lệ' });
    }

    try {
        // 2️⃣ Thực hiện xóa bài viết (atomic — chỉ 1 query)
        const deleted = await Post.findByIdAndDelete(id);

        // 3️⃣ Nếu không có bài viết nào trùng ID → báo lỗi
        if (!deleted) {
            return res.status(404).json({ error: 'Không tìm thấy bài viết', id });
        }

        // 4️⃣ Thành công → trả kết quả
        return res.status(200).json({
            message: 'Đã xóa bài viết thành công',
            deletedPost: deleted,
            deletedBy: { id: req.user?.id, name: req.user?.name }
        });
    } catch (err) {
        console.error('Delete post error:', err);
        return res.status(500).json({
            error: 'Lỗi server',
            message: 'Không thể xóa bài viết'
        });
    }
});

// DELETE /posts/:id - Xóa bài viết

// router.delete('/:id', (req, res) => {
//     const { id } = req.params;

//     // ✅ Mảng dữ liệu giả lập
//     // let posts = [
//     //     { id: "1", title: "Bài học đầu tiên", content: "Bài này học về REST API" },
//     //     { id: "2", title: "Hướng dẫn API REST", content: "Cách dựng API REST với NodeJS" },
//     //     { id: "3", title: "Mẹo JavaScript", content: "Một số mẹo nhỏ khi dùng JavaScript hiệu quả." }
//     // ];

//     // ✅ Tìm vị trí bài viết theo id
//     const index = posts.findIndex(p => p.id === id);

//     // ❌ Nếu không tìm thấy thì trả về lỗi 404
//     if (index === -1) {
//         return res.status(404).json({
//             error: "Không tìm thấy bài viết cần xóa",
//             id: id
//         });
//     }

//     // ✅ Xóa bài viết bằng splice()  cú pháp array.splice(start, deleteCount)    array.splice(vị_trí_bắt_đầu, số_lượng_cần_xóa, ...phần_tử_mới)
//     //start	Vị trí bắt đầu xóa hoặc thêm (đếm từ 0). deleteCount	Số lượng phần tử cần xóa kể từ vị trí start.
//     const deletedPost = posts.splice(index, 1)[0]; // lấy ra phần tử bị xóa
//     //[0] → lấy phần tử đầu tiên trong mảng đó
//     //Nếu bỏ [0] thì vẫn hoạt động, nhưng khi gửi về cho client, sẽ nhận được mảng, không phải object.
//     //“Xóa bài viết ở vị trí index khỏi mảng, và lưu bài viết vừa bị xóa vào biến deletedPost.”

//     // ✅ Trả về phản hồi
//     res.status(200).json({
//         message: "Đã xóa bài viết thành công",
//         deleted: deletedPost
//     });
// });

module.exports = router;
//xuất (export) cái router ra ngoài file hiện tại để file khác có thể import và sử dụng nó.
//Hiểu nôm na: đây là cách “chia sẻ” code giữa các file trong Node.js.