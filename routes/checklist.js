const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 체크리스트 조회
router.get('/', async (req, res) => {
    try {
        const userId = req.session.user.id;

        const [skills] = await db.query(
            `SELECT
                s.id,
                s.title,
                s.category,
                s.description,
                COALESCE(lp.completed, 0) AS completed
             FROM nursing_skills s
             LEFT JOIN learning_progress lp
                ON s.id = lp.skill_id AND lp.user_id = ?
             ORDER BY s.category, s.id`,
            [userId]
        );

        const completedCount = skills.filter(
            skill => Number(skill.completed) === 1
        ).length;

        const totalCount = skills.length;

        const progressRate = totalCount === 0
            ? 0
            : Math.round(completedCount / totalCount * 100);

        res.render('checklist', {
            skills,
            completedCount,
            totalCount,
            progressRate
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('학습 체크리스트를 불러오지 못했습니다.');
    }
});

// 학습 완료 상태 변경
router.post('/:id/toggle', async (req, res) => {
    try {
        const userId = req.session.user.id;
        const skillId = req.params.id;

        const [existing] = await db.query(
            `SELECT completed FROM learning_progress
             WHERE user_id = ? AND skill_id = ?`,
            [userId, skillId]
        );

        if (existing.length > 0) {
            const newStatus = existing[0].completed ? 0 : 1;

            await db.query(
                `UPDATE learning_progress
                 SET completed = ?,
                     completed_at = IF(?, CURRENT_TIMESTAMP, completed_at)
                 WHERE user_id = ? AND skill_id = ?`,
                [newStatus, newStatus, userId, skillId]
            );
        } else {
            await db.query(
                `INSERT INTO learning_progress
                 (user_id, skill_id, completed)
                 VALUES (?, ?, TRUE)`,
                [userId, skillId]
            );
        }

        res.redirect('/checklist');
    } catch (error) {
        console.error(error);
        res.status(500).send('학습 상태 변경에 실패했습니다.');
    }
});

module.exports = router;
