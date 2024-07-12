USE twitter_db;

DELETE FROM users WHERE user_id IN (
    SELECT user_id
    FROM users
    GROUP BY user_id
    HAVING COUNT(*) > 1
);