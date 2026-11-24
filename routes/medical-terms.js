const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 의학용어 검색 및 목록 조회
router.get('/', async (req, res) => {
    try {
        const keyword = (req.query.keyword || '').trim();
        const category = (req.query.category || '').trim();

        let sql = 'SELECT * FROM medical_terms WHERE 1=1';
        const params = [];

        if (keyword) {
            sql += ` AND (
                english LIKE ?
                OR korean LIKE ?
                OR pronunciation LIKE ?
                OR description LIKE ?
            )`;

            const search = `%${keyword}%`;
            params.push(search, search, search, search);
        }

        if (category) {
            sql += ' AND category = ?';
            params.push(category);
        }

        sql += ' ORDER BY category ASC, english ASC';

        const [terms] = await db.query(sql, params);

        const [categories] = await db.query(
            'SELECT DISTINCT category FROM medical_terms ORDER BY category'
        );

        res.render('medical-terms', {
            terms,
            categories,
            keyword,
            selectedCategory: category
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('의학용어를 불러오지 못했습니다.');
    }
});

module.exports = router;
