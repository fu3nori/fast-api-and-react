import React, { useState } from 'react';
import '../App.css';

const UserRegist = () => {
    const [formData, setFormData] = useState({
        mail: '',
        pen_name: '',
        password: '',
        zipcode: '',
        prefectures: '',
        municipalities: '',
        town_name: '',
        address: '',
        obj: ''
    });

    const [errors, setErrors] = useState({});
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

    // 入力欄変更時のハンドラ
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    // バリデーション
    const validateForm = () => {
        const newErrors = {};
        if (!formData.mail) newErrors.mail = "メールアドレスが未入力です。";
        if (!formData.pen_name) newErrors.pen_name = "ペンネームが未入力です。";
        if (!formData.password) newErrors.password = "パスワードが未入力です。";
        if (!formData.zipcode) newErrors.zipcode = "郵便番号が未入力です。";
        if (!formData.prefectures) newErrors.prefectures = "都道府県が未入力です。";
        if (!formData.municipalities) newErrors.municipalities = "市区町村が未入力です。";
        if (!formData.town_name) newErrors.town_name = "町名・区名が未入力です。";
        if (!formData.address) newErrors.address = "番地が未入力です。";
        // 建物・部屋番号 (obj) は任意
        return newErrors;
    };

    // フォーム送信ハンドラ
    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            // エラーがある場合、画面トップへスクロール
            window.scrollTo(0, 0);
            return;
        } else {
            setErrors({});
        }

        try {
            // 非同期postの実装は後で行います
            /*
            const response = await fetch('/api/user_regist.py', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(formData),
            });
            const result = await response.json();
            // 結果に応じた処理
            */
            console.log("送信データ:", formData);
            alert("ユーザー登録が送信されました！");
        } catch (error) {
            console.error(error);
            setSubmitError("登録中にエラーが発生しました。");
        }
    };

    // リセットボタン
    const handleReset = () => {
        setFormData({
            mail: '',
            pen_name: '',
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

    // 郵便番号検索ボタンの実装
    const handleZipcodeSearch = async () => {
        // 入力された郵便番号（ハイフン除去）
        const rawZipcode = formData.zipcode || '';
        const zipcode = rawZipcode.replace(/-/g, ''); // ハイフンが含まれていたら除去

        if (!zipcode) {
            alert("郵便番号が入力されていません");
            return;
        }

        try {
            // zipcloudのAPIを使って住所を検索
            const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipcode}`);
            const data = await response.json();

            if (data.status !== 200) {
                // 200以外の場合はエラーや結果なしなど
                alert(data.message || "郵便番号の検索結果がありませんでした");
                return;
            }

            if (!data.results) {
                // 結果が見つからない場合
                alert("該当する住所が見つかりませんでした");
                return;
            }

            // 結果が見つかった場合は先頭を使用
            const result = data.results[0];
            // address1: 都道府県, address2: 市区町村, address3: 町域
            setFormData((prev) => ({
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

    return (
        <div>
            {/* バリデーションエラーを画面上部に赤文字で表示 */}
            {Object.keys(errors).length > 0 && (
                <div className="error-message">
                    {Object.values(errors).map((errorMsg, index) => (
                        <div key={index}>{errorMsg}</div>
                    ))}
                </div>
            )}
            {submitError && <div className="submit-error">{submitError}</div>}
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
                <div className="form-group form-group-zip">
                    {/* 1行目: ラベル + 入力欄 + 注釈文 */}
                    <div className="form-group-line">
                        <div className="form-label">郵便番号:</div>
                        <div className="form-input">
                            <input
                                type="text"
                                name="zipcode"
                                value={formData.zipcode}
                                onChange={handleInputChange}
                                required
                            />
                            <span className="form-note">※郵便番号を入力してください</span>
                        </div>
                    </div>
                    {/* 2行目: ボタンのみ配置 */}
                    <div className="zipcode-button-container">
                        <button
                            type="button"
                            className="zipcode-button"
                            onClick={handleZipcodeSearch}
                        >
                            郵便番号から入力
                        </button>
                    </div>
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
                            {prefecturesList.map((pref, index) => (
                                <option key={index} value={pref}>
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
                        <span className="form-note">※市区町村を入力してください</span>
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
                        <span className="form-note">※町名・区名を入力してください</span>
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
                        <span className="form-note">※番地を入力してください</span>
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
                        <span className="form-note">※建物・部屋番号は任意です</span>
                    </div>
                </div>

                {/* 送信・リセットボタン */}
                <div className="form-group">
                    <div className="form-label"></div>
                    <div className="form-input">
                        <button type="submit" className="submit-button">
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
