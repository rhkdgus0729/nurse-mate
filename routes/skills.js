
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 간호 술기 목록
router.get('/', async (req, res) => {
    try {
        const [skills] = await db.query(
            `SELECT s.*,
                IF(lp.completed = 1, 1, 0) AS completed
             FROM nursing_skills s
             LEFT JOIN learning_progress lp
             ON s.id = lp.skill_id AND lp.user_id = ?
             ORDER BY s.id ASC`,
            [req.session.user.id]
        );

        res.render('skills', { skills });
    } catch (error) {
        console.error(error);
        res.status(500).send('술기 목록을 불러오지 못했습니다.');
    }
});

// 간호 술기 상세
router.get('/:id', async (req, res) => {
    try {
        const [skills] = await db.query(
            'SELECT * FROM nursing_skills WHERE id = ?',
            [req.params.id]
        );

        if (skills.length === 0) {
            return res.status(404).send('해당 술기를 찾을 수 없습니다.');
        }

        const [progress] = await db.query(
            `SELECT completed FROM learning_progress
             WHERE user_id = ? AND skill_id = ?`,
            [req.session.user.id, req.params.id]
        );

        res.render('skill-detail', {
            skill: skills[0],
            completed: progress.length > 0 && progress[0].completed === 1
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('술기 정보를 불러오지 못했습니다.');
    }
});

// 학습 완료 처리
router.post('/:id/complete', async (req, res) => {
    try {
        const skillId = req.params.id;
        const userId = req.session.user.id;

        await db.query(
            `INSERT INTO learning_progress
                (user_id, skill_id, completed)
             VALUES (?, ?, TRUE)
             ON DUPLICATE KEY UPDATE
                completed = TRUE,
                completed_at = CURRENT_TIMESTAMP`,
            [userId, skillId]
        );

        res.redirect(`/skills/${skillId}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('학습 기록 저장에 실패했습니다.');
    }
});

module.exports = router;
