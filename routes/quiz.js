const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 퀴즈 문제 조회
router.get('/', async (req, res) => {
    try {
        const [questions] = await db.query(
            `SELECT id, category, question,
                    option1, option2, option3, option4
             FROM quiz_questions
             ORDER BY id ASC`
        );

        res.render('quiz', {
            questions,
            result: null
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('퀴즈를 불러오지 못했습니다.');
    }
});

// 퀴즈 정답 제출 및 채점
router.post('/submit', async (req, res) => {
    try {
        const [questions] = await db.query(
            'SELECT * FROM quiz_questions ORDER BY id ASC'
        );

        const answers = req.body.answers || {};
        let score = 0;

        const details = questions.map(question => {
            const selected = Number(answers[question.id] || 0);
            const isCorrect = selected === question.answer;

            if (isCorrect) {
                score++;
            }

            return {
                id: question.id,
                selected,
                answer: question.answer,
                isCorrect,
                explanation: question.explanation
            };
        });

        res.render('quiz', {
            questions,
            result: {
                score,
                total: questions.length,
                details
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('퀴즈 채점에 실패했습니다.');
    }
});

module.exports = router;
