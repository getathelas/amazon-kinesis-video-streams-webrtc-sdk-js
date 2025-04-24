
/**
 * Service for managing streaming sessions via the Athelas API
 */
function createStreamingSession(token) {
    return fetch('https://staging-rcm-api.athelas.com/v1/scribe/live-streaming/sessions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(`Failed to create session: ${errorData.message || response.statusText}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('[Session Service] Session created:', data.data);
            return data.data;
        })
        .catch(error => {
            console.error('[Session Service] Create session error:', error);
            throw error;
        });
}

function getChannelData(token, sessionId, role = 'VIEWER') {
    return fetch(`https://staging-rcm-api.athelas.com/v1/scribe/live-streaming/sessions/${sessionId}/channel_data?role=${role}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(`Failed to get channel data: ${errorData.message || response.statusText}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('[Session Service] Channel data retrieved:', data.data);
            return data.data;
        })
        .catch(error => {
            console.error('[Session Service] Get channel data error:', error);
            throw error;
        });
}
