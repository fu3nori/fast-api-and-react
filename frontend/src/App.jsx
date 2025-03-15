import { useState, useEffect } from 'react'
import UserRegist from './components/UserRegist'
import Dashboard from './components/Dashboard'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
    // セッション情報。実際はオブジェクトやJWTトークンなどになるが、ここでは簡単のため真偽値またはオブジェクトを使用。
    const [session, setSession] = useState(null)

    // 初回マウント時にlocalStorageからセッション情報を読み込む（あれば）
    useEffect(() => {
        const savedSession = localStorage.getItem("session")
        if (savedSession) {
            setSession(JSON.parse(savedSession))
        }
    }, [])

    // 登録成功時にUserRegist.jsxから呼ばれるコールバック
    const handleRegistSuccess = (sessionData) => {
        // sessionDataはバックエンド側で発行されたセッション情報等（ここでは仮にオブジェクトを想定）
        setSession(sessionData)
        localStorage.setItem("session", JSON.stringify(sessionData))
    }

    // ログアウト時の処理（Dashboard.jsxから利用）
    const handleLogout = () => {
        setSession(null)
        localStorage.removeItem("session")
    }

    return (
        <>
            <div>
                <a href="https://vite.dev" target="_blank" rel="noreferrer">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank" rel="noreferrer">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>

            <div className="App">
                {session ? (
                    <Dashboard onLogout={handleLogout} />
                ) : (
                    <UserRegist onSuccess={handleRegistSuccess} />
                )}
            </div>

            <h1>Powered by Vite + React</h1>
        </>
    )
}

export default App
