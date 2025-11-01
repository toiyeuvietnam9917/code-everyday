// Sử dụng NodeJS để làm 1 cái REST API chạy trên port 8080 của máy tính.
// nạp thư viện express vào Vì Express không có sẵn trong NodeJS — mình phải “nạp” nó vào từ thư viện. Giống như: “Ê Node ơi, cho tao dùng Express nhé.”
// Import thư viện express
const express = require('express'); // gọi thư viện express
// khởi tạo ứng dụng express Dòng này khởi tạo ứng dụng Express, tức là tạo ra một “server object” — gọi là app. Giống như: “Tao đã bật cái web server lên rồi đó.”

const mongoose = require('mongoose');
// require('mongoose') → là “gọi thư viện” để Node.js hiểu cách làm việc với MongoDB.
//phải import mongoose để gọi hàm connect().

// Import routes ở ĐÂY
const authRoutes = require('./routes/authRoutes'); // <== nằm TRÊN app.use
const postRoutes = require('./routes/postRoutes');


const app = express(); // Tạo ứng dụng Express
// CẤU HÌNH MIDDLEWARE =====
// Dùng middleware này để server hiểu dữ liệu JSON gửi từ client (Postman, front-end)
app.use(express.json());

// ===================== KẾT NỐI MONGODB =====================
mongoose.connect('mongodb://127.0.0.1:27017/node_rest_demo')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection failed:', err));
//mongoose.connect(...) → là “nối dây điện” giữa code  và database MongoDB trên máy.
//node_rest_demo Tên của database (MongoDB tự tạo nếu chưa có)

// ===================== MODELS =====================
const Post = require('./models/Post');
const User = require('./models/User');

// ===================== ROUTES =====================
app.use('/api/auth', authRoutes); // <== nằm DƯỚI require
app.use('/api/posts', postRoutes);





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





// ===== BƯỚC 3: ĐỊNH NGHĨA CÁC API (ROUTES) =====
// (1) GET - Lấy danh sách user
// app.get('/users', (req, res) => {
//     res.json([
//         { id: 1, name: 'Tony' },
//         { id: 2, name: 'Emi' }
//     ]);
// });



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




// (4) DELETE - Xóa user
// app.delete('/users/:id', (req, res) => {
//     const id = req.params.id;
//     res.json({ message: `Đã xóa user có ID = ${id}` });
// });






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

