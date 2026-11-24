const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');

// 회원가입
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.send('모든 항목을 입력해 주세요.');
        }

        const [users] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (users.length > 0) {
            return res.send('이미 가입된 이메일입니다.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).send('회원가입 중 오류가 발생했습니다.');
    }
});

// 로그인
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.send('가입되지 않은 이메일입니다.');
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.send('비밀번호가 일치하지 않습니다.');
        }

        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email
        };

        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('로그인 중 오류가 발생했습니다.');
    }
});

// 로그아웃
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

module.exports = router;
