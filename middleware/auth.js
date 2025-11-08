const jwt = require('jsonwebtoken');

// Nếu bạn chưa có .env, thì dòng dưới giúp có giá trị mặc định
//process.env Là nơi Node.js lưu biến môi trường (environment variables)
//process.env.JWT_SECRET - Biến môi trường có tên JWT_SECRET. Nếu tồn tại, lấy giá trị đó.
//“Lấy JWT_SECRET trong môi trường nếu có, còn nếu không có thì tạm dùng chuỗi 'my_secret_key_123' làm giá trị mặc định.”
const JWT_SECRET = process.env.JWT_SECRET || 'my_secret_key_123';

/* ========== Middleware: Kiểm tra JWT ========== */
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
    //scheme là phần định nghĩa loại cơ chế xác thực mà client đang dùng.
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

module.exports = { requireAuth };
//Trong Node.js, mỗi file .js là một “module riêng”,
// và module.exports chính là cách để xuất (export) thứ gì đó
// ra bên ngoài để file khác có thể require() và sử dụng nó.
//Tao export một object có key là requireAuth, value là chính cái hàm requireAuth\
//Tức là khi file khác require nó: const { requireAuth } = require('../middleware/auth');
//require('../middleware/auth') trả về { requireAuth: [Function] }