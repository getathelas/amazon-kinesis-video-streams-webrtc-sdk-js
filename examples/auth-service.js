function loginAndGetToken(username, password) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    return fetch('https://staging-rcm-api.athelas.com/v1/auth/token', {
        method: 'POST',
        body: formData,
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((errorData) => {
                    throw new Error(`Authentication failed: ${errorData.message || response.statusText}`);
                });
            }
            return response.json();
        })
        .then((data) => {
            return data.data?.access_token || data.access_token;
        })
        .catch((error) => {
            console.error('[Auth Service] Login error:', error);
            throw error;
        });
}
