import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // React Routerを使う場合のみ
import '../App.css'; // フォームレイアウト用のCSSをここに書くか、App.css等に記述

/**
 * onSuccess: ユーザー登録が成功したときに呼び出されるコールバック関数
 *            (App.jsx 側で session を更新するなどの処理に使う)
 */
const UserRegist = ({ onSuccess }) => {
    // React Router の useNavigate フックでページ遷移を実現 (必要な場合)
    const navigate = useNavigate();

    // フォーム入力値を管理するステート
    const [formData, setFormData] = useState({
        mail: '',
        pen_name: '',
        real_name: '',
        password: '',
        zipcode: '',
        prefectures: '',
        municipalities: '',
        town_name: '',
        address: '',
        obj: ''
    });

    // バリデーションエラーを保持するステート
    const [errors, setErrors] = useState({});
    // フォーム送信時のサーバーエラー等を表示するステート
    const [submitError, setSubmitError] = useState('');

    // 47都道府県＋「その他」
    const prefecturesList = [
        "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
        "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
        "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
        "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
        "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
        "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
        "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県", "その他"
    ];

    /**
     * 入力値が変化したときにステートを更新する
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    /**
     * フォームの必須項目をチェックし、エラーがあれば errors オブジェクトを返す
     */
    const validateForm = () => {
        const newErrors = {};
        if (!formData.mail) newErrors.mail = "メールアドレスが未入力です。";
        if (!formData.pen_name) newErrors.pen_name = "ペンネームが未入力です。";
        if (!formData.real_name) newErrors.real_name = "本名が未入力です。";
        if (!formData.password) newErrors.password = "パスワードが未入力です。";
        if (!formData.zipcode) newErrors.zipcode = "郵便番号が未入力です。";
        if (!formData.prefectures) newErrors.prefectures = "都道府県が未入力です。";
        if (!formData.municipalities) newErrors.municipalities = "市区町村が未入力です。";
        if (!formData.town_name) newErrors.town_name = "町名・区名が未入力です。";
        if (!formData.address) newErrors.address = "番地が未入力です。";
        // 建物・部屋番号(obj) は任意
        return newErrors;
    };

    /**
     * 郵便番号から住所を自動入力するボタンのハンドラ
     */
    const handleZipcodeSearch = async () => {
        const rawZipcode = formData.zipcode || '';
        // ハイフンを除去
        const zipcode = rawZipcode.replace(/-/g, '');
        if (!zipcode) {
            alert("郵便番号が入力されていません");
            return;
        }

        try {
            const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipcode}`);
            const data = await response.json();

            if (data.status !== 200) {
                alert(data.message || "郵便番号の検索結果がありませんでした");
                return;
            }
            if (!data.results) {
                alert("該当する住所が見つかりませんでした");
                return;
            }

            const result = data.results[0];
            // APIの結果をフォームに反映
            setFormData(prev => ({
                ...prev,
                prefectures: result.address1,
                municipalities: result.address2,
                town_name: result.address3
            }));
        } catch (error) {
            console.error(error);
            alert("郵便番号検索中にエラーが発生しました");
        }
    };

    /**
     * フォーム送信時のハンドラ
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        // バリデーションチェック
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            // エラーがある場合、ページトップへスクロール
            window.scrollTo(0, 0);
            return;
        } else {
            setErrors({});
        }

        try {
            // ユーザー登録APIへPOST
            const response = await fetch('/api/user_regist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                // 200系以外のHTTPステータスの場合
                const errorData = await response.json();
                setSubmitError(errorData.detail || "登録中にエラーが発生しました。");
                return;
            }

            // 登録成功時の処理
            const result = await response.json();
            console.log("サーバー応答:", result);

            // JWTトークンなどを localStorage に保存（キーは "session" などに統一）
            localStorage.setItem("session", JSON.stringify(result.session));

            alert("ユーザー登録に成功しました！");

            // App.jsx などで定義したコールバックがあれば呼び出す
            // => これによりApp.jsxのsessionステートが更新され、ダッシュボードへ切り替わる
            if (onSuccess) {
                onSuccess(result.session);
            }

            // もし React Router のルーティングを使ってページ遷移したい場合
            // navigate("/dashboard");

        } catch (error) {
            console.error(error);
            setSubmitError("登録中にエラーが発生しました。");
        }
    };

    /**
     * フォームリセットボタンのハンドラ
     */
    const handleReset = () => {
        setFormData({
            mail: '',
            pen_name: '',
            real_name: '',
            password: '',
            zipcode: '',
            prefectures: '',
            municipalities: '',
            town_name: '',
            address: '',
            obj: ''
        });
        setErrors({});
        setSubmitError('');
    };

    return (
        <div>
            {/* バリデーションエラーの表示 */}
            {Object.keys(errors).length > 0 && (
                <div className="error-message">
                    {Object.values(errors).map((msg, idx) => (
                        <div key={idx}>{msg}</div>
                    ))}
                </div>
            )}
            {/* サーバーエラー等の表示 */}
            {submitError && <div className="submit-error">{submitError}</div>}

            <h2>ユーザー新規登録</h2>

            <form onSubmit={handleSubmit}>
                {/* メールアドレス */}
                <div className="form-group">
                    <div className="form-label">メールアドレス:</div>
                    <div className="form-input">
                        <input
                            type="email"
                            name="mail"
                            value={formData.mail}
                            onChange={handleInputChange}
                            required
                        />
                        <span className="form-note">※メールアドレスを入力してください</span>
                    </div>
                </div>

                {/* ペンネーム */}
                <div className="form-group">
                    <div className="form-label">ペンネーム:</div>
                    <div className="form-input">
                        <input
                            type="text"
                            name="pen_name"
                            value={formData.pen_name}
                            onChange={handleInputChange}
                            required
                        />
                        <span className="form-note">※ペンネームを入力してください</span>
                    </div>
                </div>

                {/* 本名 */}
                <div className="form-group">
                    <div className="form-label">本名:</div>
                    <div className="form-input">
                        <input
                            type="text"
                            name="real_name"
                            value={formData.real_name}
                            onChange={handleInputChange}
                            required
                        />
                        <span className="form-note">
              ※本名を入力してください(公開されず契約時のみ表示されます)
            </span>
                    </div>
                </div>

                {/* パスワード */}
                <div className="form-group">
                    <div className="form-label">パスワード:</div>
                    <div className="form-input">
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />
                        <span className="form-note">※パスワードを入力してください</span>
                    </div>
                </div>


                {/* 郵便番号 */}
                <div className="form-group">
                    <div className="form-label">郵便番号:</div>
                    <div className="form-input">
                        <input
                            type="text"
                            name="zipcode"
                            value={formData.zipcode}
                            onChange={handleInputChange}
                            required
                        />
                        <span className="form-note">※郵便番号を入力してください(公開されず契約時のみ表示されます)</span>
                    </div>
                </div>


                {/* 郵便番号検索ボタン */}

                <div className="form-group" style={{marginLeft: '160px'}}>
                    <button
                        type="button"
                        className="zipcode-button"
                        style={{backgroundColor: 'cyan', color: 'black', border: 'none', padding: '5px 10px'}}
                        onClick={handleZipcodeSearch}
                    >
                        郵便番号から入力
                    </button>
                </div>

                {/* 都道府県 */}
                <div className="form-group">
                    <div className="form-label">都道府県:</div>
                    <div className="form-input">
                        <select
                            name="prefectures"
                            value={formData.prefectures}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">選択してください</option>
                            {prefecturesList.map((pref, idx) => (
                                <option key={idx} value={pref}>
                                    {pref}
                                </option>
                            ))}
                        </select>
                        <span className="form-note">※都道府県を選択してください</span>
                    </div>
                </div>

                {/* 市区町村 */}
                <div className="form-group">
                    <div className="form-label">市区町村:</div>
                    <div className="form-input">
                        <input
                            type="text"
                            name="municipalities"
                            value={formData.municipalities}
                            onChange={handleInputChange}
                            required
                        />
                        <span className="form-note">
              ※市区町村を入力してください(公開されず契約時のみ表示されます)
            </span>
                    </div>
                </div>

                {/* 町名・区名 */}
                <div className="form-group">
                    <div className="form-label">町名・区名:</div>
                    <div className="form-input">
                        <input
                            type="text"
                            name="town_name"
                            value={formData.town_name}
                            onChange={handleInputChange}
                            required
                        />
                        <span className="form-note">
              ※町名・区名を入力してください(公開されず契約時のみ表示されます)
            </span>
                    </div>
                </div>

                {/* 番地 */}
                <div className="form-group">
                    <div className="form-label">番地:</div>
                    <div className="form-input">
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                        />
                        <span className="form-note">
              ※番地を入力してください(公開されず契約時のみ表示されます)
            </span>
                    </div>
                </div>

                {/* 建物・部屋番号 */}
                <div className="form-group">
                    <div className="form-label">建物・部屋番号:</div>
                    <div className="form-input">
                        <input
                            type="text"
                            name="obj"
                            value={formData.obj}
                            onChange={handleInputChange}
                        />
                        <span className="form-note">
              ※建物・部屋番号は任意です(公開されず契約時のみ表示されます)
            </span>
                    </div>
                </div>

                {/* 送信・リセットボタン */}
                <div className="form-group">
                    <div className="form-label"></div>
                    <div className="form-input">
                        <button type="submit" className="submit-button" style={{marginRight: '10px'}}>
                            登録する
                        </button>
                        <button type="button" onClick={handleReset} className="reset-button">
                            リセットする
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default UserRegist;
