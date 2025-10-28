// Sử dụng NodeJS để làm 1 cái REST API chạy trên port 8080 của máy tính.
// nạp thư viện express vào Vì Express không có sẵn trong NodeJS — mình phải “nạp” nó vào từ thư viện. Giống như: “Ê Node ơi, cho tao dùng Express nhé.”
// Import thư viện express
const express = require('express'); // gọi thư viện express
// khởi tạo ứng dụng express Dòng này khởi tạo ứng dụng Express, tức là tạo ra một “server object” — gọi là app. Giống như: “Tao đã bật cái web server lên rồi đó.”
const app = express(); // Tạo ứng dụng Express
// CẤU HÌNH MIDDLEWARE =====
// Dùng middleware này để server hiểu dữ liệu JSON gửi từ client (Postman, front-end)
app.use(express.json());

// ===================== KẾT NỐI MONGODB =====================
const mongoose = require('mongoose');
// require('mongoose') → là “gọi thư viện” để Node.js hiểu cách làm việc với MongoDB.

mongoose.connect('mongodb://127.0.0.1:27017/node_rest_demo')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection failed:', err));
//mongoose.connect(...) → là “nối dây điện” giữa code  và database MongoDB trên máy.
//node_rest_demo Tên của database (MongoDB tự tạo nếu chưa có)

// ===================== TẠO SCHEMA & MODEL =====================
// 🧱 1. Tạo Schema (khuôn dữ liệu) - Định nghĩa cấu trúc dữ liệu bài viết (post)
const postSchema = new mongoose.Schema({
    title: { type: String, required: true },    // bắt buộc có title (chuỗi)
    content: { type: String, required: true }   // bắt buộc có content (chuỗi)
}, { timestamps: true }); // tự động thêm createdAt, updatedAt
// 2. Tạo Model - đại diện cho collection "posts"
const Post = mongoose.model('Post', postSchema);
//Tên Model nên viết hoa chữ cái đầu, vì nó là “class” (lớp đối tượng) đại diện cho 1 loại dữ liệu.
//Post không phải là 1 bài viết duy nhất. Nó là “khuôn” để tạo ra nhiều bài viết. (giống như class Student → tạo ra nhiều student)



// Khai báo dữ liệu dùng chung (nằm ngoài API)
let posts = [
    { id: "1", title: "Bài 1", content: "Giới thiệu REST API" },
    { id: "2", title: "Bài 2", content: "NodeJS cơ bản" },
    { id: "3", title: "Bài 3", content: "ExpressJS là gì" },
    { id: "4", title: "Bài 4", content: "Cách dùng Postman" },
    { id: "5", title: "Bài 5", content: "JSON và HTTP" },
    { id: "6", title: "Bài 6", content: "Routing trong Express" },
    { id: "7", title: "Bài 7", content: "Middleware là gì" },
    { id: "8", title: "Bài 8", content: "Error Handling cơ bản" },
    { id: "9", title: "Bài 9", content: "CRUD API với NodeJS" },
    { id: "10", title: "Bài 10", content: "Tổng kết REST API" }
];

// định nghĩa 1 route (đường dẫn) cơ bản
// '/’ nghĩa là đường dẫn gốc (trang chủ). Khi ai đó truy cập http://localhost:3001/, code trong ngoặc sẽ chạy.
// (req, res) là request và response — 2 đối tượng quan trọng trong REST API. Giống như: “Nếu ai gõ vô trang chủ thì trả lời họ dòng ‘Server đang chạy ngon lành!’ nha.”

app.get('/', (req, res) => {
    res.send('Server đang chạy ngon lành!');
});

app.get('/hello-word', (req, res) => {
    // res.send("Oke");
    // res.json({ message: "Oke" });
    res.json([
        { id: 1, name: 'Tony' },
        { id: 2, name: 'Emi' },
        { id: 3, name: 'Peter' },
        { id: 4, name: 'Sophia' },
        { id: 5, name: 'David' },
        { id: 6, name: 'Chris' },
        { id: 7, name: 'Lily' },
        { id: 8, name: 'Olivia' },
        { id: 9, name: 'Noah' },
        { id: 10, name: 'Emma' }
    ]);

}
);

// GET / tìm kiếm theo tên user
app.get('/search-users', (req, res) => {
    const { name = '' } = req.query;
    // req.query là object chứa các tham số query string từ URL gửi lên. Ví dụ nếu URL là /search-users?name=li thì req.query sẽ là { name: "li" }
    // Cú pháp { name = '' } = req.query gọi là object destructuring trong JavaScript: lấy thuộc tính name từ req.query rồi gán vào biến name.
    // Phần = '' là giá trị mặc định: nếu req.query.name không tồn tại hoặc undefined, thì biến name sẽ được gán chuỗi rỗng ''. 
    // Ví dụ nếu URL là /search-users không có ?name=..., thì name sẽ là ''.
    // Tóm lại: “Lấy tham số name từ query string nếu có, nếu không có thì đặt name là rỗng.”
    const allUsers = [
        { id: 1, name: 'Tony' },
        { id: 2, name: 'Emi' },
        { id: 3, name: 'Peter' },
        { id: 4, name: 'Sophia' },
        { id: 5, name: 'David' },
        { id: 6, name: 'Chris' },
        { id: 7, name: 'Lily' },
        { id: 8, name: 'Olivia' },
        { id: 9, name: 'Noah' },
        { id: 10, name: 'Emma' }
    ];
    const keyword = name.trim().toLowerCase();
    //trim() → loại bỏ khoảng trắng ở đầu và cuối chuỗi. Ví dụ " li " → "li". W3Schools toLowerCase() → chuyển hết chuỗi thành chữ thường. Ví dụ "LiLy" → "lily"
    //Người dùng có thể nhập " Li " hoặc "LILY" hoặc "li" → nếu không chuẩn hóa thì lọc sẽ không đúng.
    //Khi mình chuyển thành chữ thường và loại bỏ khoảng trắng dư thừa thì so sánh sẽ không phân biệt hoa thường (case-insensitive), giúp tìm tên chính xác hơn.
    const filtered = allUsers.filter(u => u.name.toLowerCase().includes(keyword));
    //filter() là phương thức của mảng trong JavaScript — nó sẽ chạy qua từng phần tử trong mảng allUsers, và giữ lại những phần tử thỏa điều kiện trong hàm callback.
    // u => Đây là arrow function (hàm mũi tên): mỗi phần tử trong allUsers được gọi là u. u chính là từng object user như { id:1, name:'Tony' }.
    // u.name.toLowerCase() -> Lấy thuộc tính name của user (u.name), rồi chuyển thành chữ thường (toLowerCase()), để việc so sánh không phân biệt hoa-thường.
    //includes() là phương thức của chuỗi khi u.name.toLowerCase() là một chuỗi; nó kiểm tra xem chuỗi đó có chứa keyword hay không. Nếu chứa → trả true, nếu không → trả false.
    //Kết quả filter(...) Những phần tử u mà hàm callback trả true sẽ được đưa vào mảng mới filtered. Những phần tử trả false thì bỏ qua 
    // chốt lại : Tạo mảng mới filtered từ allUsers, giữ lại những user có tên (chuyển thành chữ thường) chứa từ khóa keyword
    res.json({
        query: name,
        total: filtered.length,
        results: filtered
    });
    //res.json(...) → gửi phản hồi dạng JSON tới client, và Express sẽ đặt đúng header Content-Type: application/json
    //Bên trong json() là một object có ba thuộc tính:
    //query: name → gửi lại cho client biết từ khóa tìm kiếm mà họ đã dùng (name là giá trị query string).
    //total: filtered.length → gửi số lượng phần tử kết quả tìm được (độ dài mảng filtered).
    //results: filtered → mảng chứa các user thỏa điều kiện tìm kiếm.
    //.length là thuộc tính (property) của mảng — nó trả về một số (integer) cho biết mảng đang có bao nhiêu phần tử. 
});

// // Thêm 1 cái api GET /posts trả về 1 mảng các post dưới dạng {id: string, title: string, content:"string"}
// app.get('/posts', (req, res) => {
//     const posts = [
//         { id: "1", title: "Bài học đầu tiên", content: "Bài này học về REST API" },
//         { id: "2", title: "Hướng dẫn API REST", content: "Hướng dẫn cách dựng API REST với NodeJS" },
//         { id: "3", title: "Mẹo JavaScript", content: "Một số mẹo nhỏ khi dùng JavaScript hiệu quả." }
//     ];
//     res.json(posts);
// });

// LẤY DANH SÁCH BÀI VIẾT (GET /posts) và phân trang - getAllPost and pagination
app.get('/posts', async (req, res) => {
    try {
        // 1) Đọc tham số ?page & ?limit từ query, ép số và chặn min = 1
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 5, 1);
        // (tuỳ chọn sau này) filter tìm kiếm; giờ để trống
        // const filter = {};

        // 2) Đếm tổng số document để tính tổng trang
        const total = await Post.countDocuments();
        //.countDocuments() → là method (hàm có sẵn của Mongoose) dùng để đếm số lượng document (bản ghi) hiện có trong collection.
        //await → là từ khóa của JavaScript, nghĩa là “chờ MongoDB đếm xong rồi mới gán giá trị cho total”.
        //Đoạn này lấy tổng số bài viết hiện có trong DB, gán vào biến total.

        //totalPages là tổng số trang cần có, đảm bảo ≥ 1.
        const totalPages = Math.max(Math.ceil(total / limit), 1);
        //Math	Đối tượng có sẵn trong JavaScript	Chứa các hàm toán học tiện dụng. .ceil()	
        // Method của Math	Làm tròn lên đến số nguyên gần nhất. 
        // .max()	Method của Math	Chọn giá trị lớn nhất giữa các số truyền vào.


        // 3) Tính vị trí bỏ qua (skip) rồi lấy dữ liệu theo trang
        const skip = (page - 1) * limit;
        //(page - 1)	Công thức toán học	Tính xem đang ở trang số mấy.->(page − 1) = số trang cần bỏ qua trước khi hiển thị trang hiện tại.
        // limit	Phép nhân trong JS	Mỗi trang có bao nhiêu bài.
        //skip	Biến	Lưu số lượng bài cần bỏ qua.

        const posts = await Post.find()
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


// API GET /posts - phân trang
// app.get('/posts', (req, res) => {
//     const page = Math.max(parseInt(req.query.page) || 1, 1);

//     //Math là đối tượng (object) có sẵn trong JavaScript. Nó chứa nhiều hàm (method) để làm việc với toán học: như Math.max(), Math.min(), Math.round(), Math.random(), Math.floor()
//     //Trong dòng này, mình dùng Math.max() để chọn giá trị lớn hơn giữa hai số (đảm bảo không bị âm hoặc 0).
//     //Math.max(5, 1) // → 5 Math.max(-3, 1) // → 1
//     //parseInt() là hàm có sẵn của JavaScript, dùng để chuyển chuỗi (string) sang số nguyên (integer)
//     //req là viết tắt của request — đối tượng mà ExpressJS tạo ra để chứa dữ liệu client gửi lên. .
//     //query là nơi Express lưu các tham số nằm sau dấu “?” trong URL. .page là tên của key trong query string.
//     //parseInt(req.query.page) || 1  Nếu req.query.page không có hoặc không hợp lệ → dùng giá trị mặc định là 1.
//     //Lấy page từ query string (req.query.page). Chuyển nó từ chuỗi sang số (parseInt). 
//     // Nếu người dùng không gửi hoặc nhập linh tinh → mặc định là 1. Dùng Math.max(..., 1) để đảm bảo không bao giờ nhỏ hơn 1.

//     const limit = Math.max(parseInt(req.query.limit) || 3, 1);

//     //Hãy đọc số trang (page) và số lượng bài viết mỗi trang (limit) từ đường dẫn URL mà người dùng gửi lên. 
//     // Nếu họ không gửi, hoặc gửi sai, thì dùng giá trị mặc định là 1 và 3.

//     const total = posts.length;
//     const totalPages = Math.ceil(total / limit);

//     //total / limit: chia tổng số bài viết cho số bài mỗi trang → để biết có bao nhiêu trang.
//     //Math.ceil() là hàm làm tròn lên(của đối tượng Math)   Math.ceil(3.2) // → 4

//     const start = (page - 1) * limit;
//     const end = start + limit;

//     const data = posts.slice(start, end);
//     // .slice(start, end) là hàm cắt mảng trong JavaScript.
//     //Nó trả về một mảng mới chứa các phần tử từ start → end - 1. vì nó lấy theo phần thử index
//     res.json({
//         page, // tự hiểu là page: page
//         limit, // tự hiểu là limit: limit
//         total, // tự hiểu là total: total
//         totalPages, // tự hiểu là totalPages: totalPages
//         hasPrev: page > 1,
//         hasNext: page < totalPages,
//         results: data
//     });
// });


// Thêm 1 cái api GET /posts/{id} tìm và chỉ trả về 1 post duy nhất sau khi tìm kiếm trong cái mảng mình có ở trên.
// GET /posts/:id - trả về 1 bài viết
app.get('/posts/:id', (req, res) => {
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


// ===== BƯỚC 3: ĐỊNH NGHĨA CÁC API (ROUTES) =====
// (1) GET - Lấy danh sách user
// app.get('/users', (req, res) => {
//     res.json([
//         { id: 1, name: 'Tony' },
//         { id: 2, name: 'Emi' }
//     ]);
// });

// ===================== TẠO BÀI VIẾT (POST /posts) =====================
app.post('/posts', async (req, res) => {  //async: cho phép dùng từ khóa await bên trong (để “chờ” database làm xong).
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

// // POST /posts - Thêm bài viết mới
// app.post('/posts', (req, res) => {
//     const { title, content } = req.body;
//     if (!title || !content) {
//         return res.status(400).json({
//             error: "Bad Request",
//             message: "title và content là bắt buộc"
//         });
//     }

//     // const posts = [
//     //     { id: "1", title: "Bài học đầu tiên", content: "Bài này học về REST API" },
//     //     { id: "2", title: "Hướng dẫn API REST", content: "Hướng dẫn cách dựng API REST với NodeJS" },
//     //     { id: "3", title: "Mẹo JavaScript", content: "Một số mẹo nhỏ khi dùng JavaScript hiệu quả." }
//     // ];

//     // Tạo id mới — cách này là lấy max + 1
//     const newId = (posts.length + 1).toString();
//     //posts.length -> Lấy số phần tử trong mảng + thêm 1 và chuyển nó sang string vì id có kiểu string
//     const newPost = { id: newId, title, content };
//     posts.push(newPost);

//     // Trả về 201 Created và bài viết mới
//     return res.status(201).json(newPost);

//     //   res.status(201).json({
//     //     message: "Tạo bài viết thành công",
//     //     post: newPost,
//     //     location: `/posts/${newId}`
//     //   });

// });

// // (2) POST - Thêm user mới
app.post('/users', (req, res) => {
    // const newUser = req.body; // Lấy dữ liệu user từ phần body của request
    const { id, name } = req.body; // Lấy dữ liệu từ client gửi lên // tương đương với const id = req.body.id; const name = req.body.name;.
    //Nó có nghĩa là: lấy ra 2 thuộc tính id và name từ object req.body rồi gán chúng vào 2 biến cùng tên.//
    //đây là cú pháp destructuring trong JavaScript. Nó khai báo hai biến id và name cùng lúc, bằng cách bóc tách giá trị của các thuộc tính id và name từ object req.body.”

    // Trả về 400 nếu dữ liệu sai hoặc thiếu
    //typeof là toán tử trong JavaScript, dùng để kiểm tra kiểu dữ liệu của một biến.
    // Ở đây typeof id sẽ trả về kiểu dữ liệu của id. Rồi ta so sánh với 'number'
    // Dấu !== nghĩa là khác cả về giá trị và kiểu dữ liệu (so sánh nghiêm ngặt). “Nếu id không phải kiểu số thì điều kiện này đúng.”
    // Dấu || là toán tử logic OR (hoặc). Nếu một trong hai điều kiện đúng, thì toàn bộ if đúng. Chỉ khi cả hai điều kiện đều sai, if mới sai.
    // Dấu !name đã bao gồm cả trường hợp name == "", undefined, hoặc null rồi.
    if (typeof id !== 'number' || !name) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Thiếu id hoặc name không hợp lệ'
        });
    }
    // Nếu dữ liệu hợp lệ, trả về 201 như bình thường
    res.status(201).json({
        message: 'Đã thêm user mới!',
        // user: newUser
        user: { id, name }
    });
});

// // (3) PUT - Cập nhật thông tin user
// app.put('/users/:id', (req, res) => {
//     const id = req.params.id; // Lấy id từ đường dẫn /users/:id
//     const updatedUser = req.body;
//     res.json({
//         message: `Đã cập nhật user có ID = ${id}`,
//         user: updatedUser
//     });
// });

// PUT /posts/:id - Cập nhật bài viết gửi lên {title: string, content: string} 
app.put('/posts/:id', (req, res) => {
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


// (4) DELETE - Xóa user
// app.delete('/users/:id', (req, res) => {
//     const id = req.params.id;
//     res.json({ message: `Đã xóa user có ID = ${id}` });
// });


// DELETE /posts/:id - Xóa bài viết
app.delete('/posts/:id', (req, res) => {
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



// chọn cổng server chạy (ví dụ cổng 8080 )/  bắt buộc phải có 1 cổng để server biết “ngồi ở đâu”.
const PORT = 3001; // Đặt cổng server chạy

// khởi động server Nếu không có dòng này, server không chạy được. Nó bảo Express: “Nghe các yêu cầu ở cổng 8080 nhé.”
// app.listen(PORT, () => {
//     console.log(`Server đang chạy tại http://localhost:${PORT}`);
// });

// ===== BƯỚC 4: CHẠY SERVER =====
app.listen(PORT, () => {
    console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});

