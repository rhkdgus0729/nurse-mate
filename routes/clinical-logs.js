
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 실습 기록 페이지
router.get('/', async (req, res) => {
    try {
        const [logs] = await db.query(
            'SELECT * FROM clinical_logs WHERE user_id = ? ORDER BY practice_date DESC',
            [req.session.user.id]
        );

        res.render('clinical-logs', { logs });
    } catch (error) {
        console.error(error);
        res.status(500).send('실습 기록을 불러오지 못했습니다.');
    }
});

// 실습 기록 저장
router.post('/', async (req, res) => {
    try {
        const { practice_date, department, activity, reflection } = req.body;

        await db.query(
            `INSERT INTO clinical_logs
            (user_id, practice_date, department, activity, reflection)
            VALUES (?, ?, ?, ?, ?)`,
            [
                req.session.user.id,
                practice_date,
                department,
                activity,
                reflection || ''
            ]
        );

        res.redirect('/clinical-logs');
    } catch (error) {
        console.error(error);
        res.status(500).send('실습 기록 저장에 실패했습니다.');
    }
});

module.exports = router;
