
        async function getToken() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const twofa = document.getElementById('twofa').value;

            if (!email || !password) {
                showResult('tokenResult', 'Please enter email and password!', 'error');
                return;
            }

            document.getElementById('tokenBtn').disabled = true;
            document.getElementById('tokenLoader').classList.add('show');
            document.getElementById('tokenResult').textContent = 'Generating token...';
            document.getElementById('tokenResult').className = 'result-box';

            try {
                const response = await fetch('/get_token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, twofa: twofa || null })
                });

                const data = await response.json();

                if (data.success) {
                    let token = data.eaad_token || data.user_token;
                    document.getElementById('tokenResult').innerHTML = `
                        <div class="token-type-label ${data.eaad_token ? 'eaad' : ''}">
                            ${data.eaad_token ? 'EAAD Token' : 'User Token'}
                        </div>
                        <div class="token-display" onclick="copyToken('${token}')">${token}</div>
                        <button class="btn btn-small" onclick="copyToken('${token}')">📋 Copy</button>
                        <button class="btn btn-small btn-verify" onclick="useForVerify('${token}')">🔍 Verify</button>
                    `;
                    document.getElementById('tokenResult').className = 'result-box success';
                } else {
                    showResult('tokenResult', data.error || 'Failed to generate token', 'error');
                }
            } catch (error) {
                showResult('tokenResult', 'Error: ' + error.message, 'error');
            } finally {
                document.getElementById('tokenBtn').disabled = false;
                document.getElementById('tokenLoader').classList.remove('show');
            }
        }

        async function verifyToken() {
            const token = document.getElementById('verifyToken').value;

            if (!token) {
                showResult('verifyResult', 'Please enter a token to verify!', 'error');
                return;
            }

            document.getElementById('verifyBtn').disabled = true;
            document.getElementById('verifyLoader').classList.add('show');
            document.getElementById('verifyResult').textContent = 'Verifying token...';
            document.getElementById('verifyResult').className = 'result-box';

            try {
                const response = await fetch('/verify_token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: token })
                });
                const data = await response.json();

                if (data.success && data.valid) {
                    document.getElementById('verifyResult').innerHTML = `
                        <div style="color: #00ff88;">✅ Token is Valid!</div>
                        <div class="divider"></div>
                        <div><strong>👤 User Information:</strong></div>
                        <div>🧑 Name: ${data.name || 'N/A'}</div>
                        <div>🆔 ID: ${data.id}</div>
                        <div>📧 Email: ${data.email || 'N/A'}</div>
                    `;
                    document.getElementById('verifyResult').className = 'result-box success';
                } else {
                    showResult('verifyResult', data.error || 'Invalid or expired token', 'error');
                }
            } catch (error) {
                showResult('verifyResult', 'Error verifying token: ' + error.message, 'error');
            } finally {
                document.getElementById('verifyBtn').disabled = false;
                document.getElementById('verifyLoader').classList.remove('show');
            }
        }

        function useForVerify(token) {
            document.getElementById('verifyToken').value = token;
            const verifyCard = document.getElementById('verifyCard');
            if (verifyCard) {
                verifyCard.scrollIntoView({ behavior: 'smooth' });
            }
        }

        function showResult(elementId, message, type) {
            const element = document.getElementById(elementId);
            element.textContent = message;
            element.className = 'result-box ' + type;
        }

        function copyToken(token) {
            navigator.clipboard.writeText(token).then(() => {
                showToast();
            }).catch(() => {
                const textArea = document.createElement('textarea');
                textArea.value = token;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showToast();
            });
        }

        function showToast() {
            const toast = document.getElementById('copyToast');
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 2000);
        }
    