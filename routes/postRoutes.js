// routes/postRoutes.js
const express = require('express');
const Post = require('../models/Post');

const router = express.Router();

// ===================== MOCK DATA (chỉ để demo) =====================
let posts = [
    { id: '1', title: 'Bài 1', content: 'Giới thiệu REST API' },
    { id: '2', title: 'Bài 2', content: 'NodeJS cơ bản' },
    { id: '3', title: 'Bài 3', content: 'ExpressJS là gì' },
    { id: '4', title: 'Bài 4', content: 'Cách dùng Postman' },
    { id: '5', title: 'Bài 5', content: 'JSON và HTTP' },
    { id: '6', title: 'Bài 6', content: 'Routing trong Express' },
    { id: '7', title: 'Bài 7', content: 'Middleware là gì' },
    { id: '8', title: 'Bài 8', content: 'Error Handling cơ bản' },
    { id: '9', title: 'Bài 9', content: 'CRUD API với NodeJS' },
    { id: '10', title: 'Bài 10', content: 'Tổng kết REST API' }
];


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
        let filter = {};
        if (search) {
            filter = { title: { $regex: search, $options: 'i' } };
            //filter = { title: { ... } } nghĩa là: Tạo điều kiện lọc cho MongoDB: “Tôi chỉ muốn tìm những bài viết có title giống với từ khóa người nhập.”
            //$regex: là “regular expression” — cho phép tìm gần đúng. → Nếu search = "api" → Thì sẽ tìm được "REST API", "api cơ bản", "học Api nâng cao"...
            //$options: 'i': nghĩa là không phân biệt chữ hoa hay thường → "API", "api", "Api" đều được coi là giống nhau.
            //Nếu có từ khóa search → chỉ tìm bài có title chứa từ đó. Nếu không có → lấy tất cả bài.
            //{ title: { $regex: search, $options: 'i' } }
            //Đây là một object lồng nhau (nested object) { <tên_trường>: { <toán_tử_truy_vấn>: <giá_trị> } }
            // <tên_trường> = title <toán_tử_truy_vấn> = $regex <giá_trị> = search
            // ví dụ search = ap -> Tìm tất cả các document mà trường title có chứa chữ api (không phân biệt hoa thường).
        };

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

        const posts = await Post.find(filter)
            //Post là model đại diện cho collection posts.\
            //.find() là hàm của Mongoose để tìm các document (nhiều dòng) trong MongoDB.
            .sort({ createdAt: -1 }) // mới nhất lên đầu
            .skip(skip) //→ bỏ qua một số dòng đầu (cho phân trang) .find() là hàm của Mongoose để tìm các document (nhiều dòng) trong MongoDB.
            .limit(limit); //→ chỉ lấy một số lượng giới hạn (ví dụ 5 bài/trang)

        // 4) Trả kết quả + metadata phân trang
        res.json({
            page,
            limit,
            total,
            totalPages,
            hasPrev: page > 1,
            hasNext: page < totalPages,
            results: posts
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi server khi lấy danh sách bài viết' });
    }
});

// Thêm 1 cái api GET /posts/{id} tìm và chỉ trả về 1 post duy nhất sau khi tìm kiếm trong cái mảng mình có ở trên.
// GET /posts/:id - trả về 1 bài viết
router.get('/:id', (req, res) => {
    const { id } = req.params;
    // req.params là một object chứa tất cả các tham số route (route parameters) được khai báo với : trong đường dẫn.
    // Cú pháp { id } = req.params sử dụng destructuring để lấy biến id từ req.params.
    // const params = req.params; const id = params.id;
    // const posts = [
    //     { id: "1", title: "Bài học đầu tiên", content: "Bài này học về REST API" },
    //     { id: "2", title: "Hướng dẫn API REST", content: "Hướng dẫn cách dựng API REST với NodeJS" },
    //     { id: "3", title: "Mẹo JavaScript", content: "Một số mẹo nhỏ khi dùng JavaScript hiệu quả." }
    // ];
    const post = posts.find(p => p.id === id); //Dùng phương thức .find() của mảng để tìm phần tử mà p.id === id.
    //Nếu có bài viết có id trùng với id được truyền — thì post sẽ là object đó; nếu không thì post sẽ là undefined.
    if (post) {
        return res.json(post);
    }
    return res.status(404).json({ error: "Post not found", id: id });
});

// ===================== TẠO BÀI VIẾT (POST /posts) =====================
router.post('/', async (req, res) => {  //async: cho phép dùng từ khóa await bên trong (để “chờ” database làm xong).
    const { title, content } = req.body; // lấy dữ liệu từ client gửi lên
    //{ title, content } = req.body là bóc tách: tạo 2 biến title và content từ req.body. (giống: const title = req.body.title; const content = req.body.content;)
    // ✅ Kiểm tra dữ liệu có đủ không
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
        // ✅ Lưu bài viết mới vào MongoDB
        const newPost = await Post.create({ title, content });
        //Post là Model (cái “khuôn” để làm việc với collection posts trong MongoDB).
        //.create({ title, content }): tạo mới 1 document (bản ghi) trong MongoDB với 2 trường title, content.
        //await: chờ MongoDB lưu xong rồi mới gán kết quả vào newPost.
        //newPost sẽ là đối tượng vừa được lưu, có cả _id, createdAt, updatedAt…
        // ✅ Trả phản hồi cho client
        res.status(201).json({
            message: "Đã thêm bài viết mới!",
            post: newPost //chính là dữ liệu vừa lưu (để người dùng biết MongoDB đã ghi gì).
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Lỗi server",
            message: "Không thể tạo bài viết"
        });
    }
});

// PUT /posts/:id - Cập nhật bài viết gửi lên {title: string, content: string} 
router.put('/:id', (req, res) => {
    const { id } = req.params;            // Lấy giá trị id từ đường dẫn URL, ví dụ /posts/2.
    const { title, content } = req.body;  // Lấy dữ liệu mới từ body request (title, content) ( từ client gửi lên)

    // ✅ Kiểm tra dữ liệu gửi lên   // 1) Validate sớm – cắt rác trước khi chạm dữ liệu
    if (!title || !content) {
        return res.status(400).json({
            error: "Thiếu dữ liệu",
            message: "title và content là bắt buộc"
        });
    }

    // ✅ Tìm bài viết theo id
    const index = posts.findIndex(p => p.id === id);
    // findIndex() sẽ duyệt mảng từ đầu đến cuối. Tìm vị trí bài viết cần sửa trong mảng. Nếu không thấy → trả lỗi 404.
    //Dòng này có nhiệm vụ tìm xem bài viết nào trong mảng posts có id trùng với id mà client gửi lên (qua URL), và lấy vị trí (index) của bài viết đó trong mảng.

    if (index === -1) {
        return res.status(404).json({
            error: "Không tìm thấy bài viết",
            id: id
        });
    }

    // ✅ Cập nhật bài viết 
    // Không phải là khai báo lại. ✅ Mà chỉ là thay đổi phần tử bên trong mảng hiện có.
    //cập nhật (thay đổi) bài viết cũ trong mảng posts → bằng cách giữ nguyên các thuộc tính cũ, và ghi đè lại các thuộc tính mới (title, content) mà client gửi lên.
    //posts[index] Là phần tử cần cập nhật trong mảng.
    //Ý nghĩa tổng thể: Tạo ra một object mới, sao chép toàn bộ dữ liệu cũ từ posts[index], rồi ghi đè lại hai trường title và content bằng giá trị mới (client gửi lên).
    // ...posts[index] = copy toàn bộ các cặp key–value của bài viết cũ
    // posts[index] = { id: "2", title: "Cũ", content: "Cũ" }; -> ...posts[index] tương đương với: id: "2", title: "Cũ", content: "Cũ"
    posts[index] = { ...posts[index], title, content };

    // ✅ Trả về kết quả
    res.status(200).json({
        message1: "Cập nhật bài viết thành công",
        post: posts[index]
    });
});

// DELETE /posts/:id - Xóa bài viết
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    // ✅ Mảng dữ liệu giả lập
    // let posts = [
    //     { id: "1", title: "Bài học đầu tiên", content: "Bài này học về REST API" },
    //     { id: "2", title: "Hướng dẫn API REST", content: "Cách dựng API REST với NodeJS" },
    //     { id: "3", title: "Mẹo JavaScript", content: "Một số mẹo nhỏ khi dùng JavaScript hiệu quả." }
    // ];

    // ✅ Tìm vị trí bài viết theo id
    const index = posts.findIndex(p => p.id === id);

    // ❌ Nếu không tìm thấy thì trả về lỗi 404
    if (index === -1) {
        return res.status(404).json({
            error: "Không tìm thấy bài viết cần xóa",
            id: id
        });
    }

    // ✅ Xóa bài viết bằng splice()  cú pháp array.splice(start, deleteCount)    array.splice(vị_trí_bắt_đầu, số_lượng_cần_xóa, ...phần_tử_mới)
    //start	Vị trí bắt đầu xóa hoặc thêm (đếm từ 0). deleteCount	Số lượng phần tử cần xóa kể từ vị trí start.
    const deletedPost = posts.splice(index, 1)[0]; // lấy ra phần tử bị xóa
    //[0] → lấy phần tử đầu tiên trong mảng đó
    //Nếu bỏ [0] thì vẫn hoạt động, nhưng khi gửi về cho client, sẽ nhận được mảng, không phải object.
    //“Xóa bài viết ở vị trí index khỏi mảng, và lưu bài viết vừa bị xóa vào biến deletedPost.”

    // ✅ Trả về phản hồi
    res.status(200).json({
        message: "Đã xóa bài viết thành công",
        deleted: deletedPost
    });
});

module.exports = router;
