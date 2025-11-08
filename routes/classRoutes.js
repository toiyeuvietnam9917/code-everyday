// routes/classRoutes.js
const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const { requireAuth } = require('../middleware/auth');


// routes/classRoutes.js (rút gọn)
router.post('/', requireAuth, async (req, res) => {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'name là bắt buộc' });

    const clazz = await Class.create({
        name: name.trim(),
        description: description?.trim(),
        createdBy: req.user.id
    });

    res.status(201).json({ message: 'Tạo lớp thành công', class: clazz });
});

module.exports = router;
