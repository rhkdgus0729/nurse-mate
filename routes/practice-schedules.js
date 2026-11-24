const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 실습 일정 목록 조회
router.get('/', async (req, res) => {
    try {
        const [schedules] = await db.query(
            `SELECT * FROM practice_schedules
             WHERE user_id = ?
             ORDER BY practice_date ASC, start_time ASC`,
            [req.session.user.id]
        );

        res.render('practice-schedules', { schedules });
    } catch (error) {
        console.error(error);
        res.status(500).send('실습 일정을 불러오지 못했습니다.');
    }
});

// 실습 일정 등록
router.post('/', async (req, res) => {
    try {
        const {
            title,
            practice_date,
            start_time,
            end_time,
            location,
            memo
        } = req.body;

        await db.query(
            `INSERT INTO practice_schedules
            (user_id, title, practice_date, start_time, end_time, location, memo)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                req.session.user.id,
                title,
                practice_date,
                start_time || null,
                end_time || null,
                location || '',
                memo || ''
            ]
        );

        res.redirect('/practice-schedules');
    } catch (error) {
        console.error(error);
        res.status(500).send('실습 일정 등록에 실패했습니다.');
    }
});

// 실습 일정 삭제
router.post('/:id/delete', async (req, res) => {
    try {
        await db.query(
            'DELETE FROM practice_schedules WHERE id = ? AND user_id = ?',
            [req.params.id, req.session.user.id]
        );

        res.redirect('/practice-schedules');
    } catch (error) {
        console.error(error);
        res.status(500).send('실습 일정 삭제에 실패했습니다.');
    }
});

module.exports = router;
