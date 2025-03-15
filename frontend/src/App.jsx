import { useState, useEffect } from 'react'
import UserRegist from './components/UserRegist'
import Dashboard from './components/Dashboard'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
    const [session, setSession] = useState(null)

    // 初回マウント時に localStorage からセッション情報を読み込む
    useEffect(() => {
        const savedSession = localStorage.getItem("session")
        if (savedSession && savedSession !== "undefined") {
            setSession(JSON.parse(savedSession))
        }
    }, [])

    // 登録成功時に UserRegist.jsx から呼ばれるコールバック
    const handleRegistSuccess = (sessionData) => {
        setSession(sessionData)
        localStorage.setItem("session", JSON.stringify(sessionData))
    }

    // ログアウト時の処理
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
