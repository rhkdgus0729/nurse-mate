const db = require('./config/db');

async function testConnection() {
    try {
        const [rows] = await db.query('SELECT NOW() AS currentTime');
        console.log('MySQL 연결 성공!');
        console.log('현재 DB 시간:', rows[0].currentTime);
    } catch (error) {
        console.error('MySQL 연결 실패:', error.message);
    } finally {
        process.exit();
    }
}

testConnection();

