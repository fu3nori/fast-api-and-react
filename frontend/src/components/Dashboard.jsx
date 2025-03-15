import React from 'react';

const Dashboard = ({ onLogout }) => {
    return (
        <div style={{ marginTop: '2rem' }}>
            <h2>ダッシュボード</h2>
            <p>ユーザー登録（またはログイン）が完了しました！</p>
            <button onClick={onLogout}>ログアウト</button>
        </div>
    );
};

export default Dashboard;
