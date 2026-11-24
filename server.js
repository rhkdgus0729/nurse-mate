const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const db = require('./config/db');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

const skillsRoutes = require('./routes/skills');
app.use('/skills', requireLogin, skillsRoutes);
// 학습 체크리스트
const checklistRoutes = require('./routes/checklist');
app.use('/checklist', requireLogin, checklistRoutes);


const clinicalLogsRoutes = require('./routes/clinical-logs');
app.use('/clinical-logs', requireLogin, clinicalLogsRoutes);

const practiceSchedulesRoutes = require('./routes/practice-schedules');
app.use('/practice-schedules', requireLogin, practiceSchedulesRoutes);

const quizRoutes = require('./routes/quiz');
app.use('/quiz', requireLogin, quizRoutes);

const medicalTermsRoutes = require('./routes/medical-terms');
app.use('/medical-terms', requireLogin, medicalTermsRoutes);

// 대시보드
app.get('/', requireLogin, async (req, res) => {
    try {
        const userId = req.session.user.id;

        const [totalResult] = await db.query(
            'SELECT COUNT(*) AS total FROM nursing_skills'
        );

        const [completedResult] = await db.query(
            `SELECT COUNT(*) AS completed
             FROM learning_progress
             WHERE user_id = ? AND completed = TRUE`,
            [userId]
        );

        const [logsResult] = await db.query(
            'SELECT COUNT(*) AS total FROM clinical_logs WHERE user_id = ?',
            [userId]
        );

        const [schedulesResult] = await db.query(
            'SELECT COUNT(*) AS total FROM practice_schedules WHERE user_id = ?',
            [userId]
        );

        const totalSkills = totalResult[0].total;
        const completedSkills = completedResult[0].completed;

        const progressRate = totalSkills === 0
            ? 0
            : Math.round((completedSkills / totalSkills) * 100);

        res.render('index', {
            stats: {
                totalSkills,
                completedSkills,
                progressRate,
                totalLogs: logsResult[0].total,
                totalSchedules: schedulesResult[0].total
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('대시보드를 불러오지 못했습니다.');
    }
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nurse Mate 서버 실행 중: ${PORT}`);
});
