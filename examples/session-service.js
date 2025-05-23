/**
 * Service for managing streaming sessions via the Athelas API
 */
function createStreamingSession(token) {
    return fetch(`${base_url()}/v1/scribe/live-streaming/sessions`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((errorData) => {
                    throw new Error(`Failed to create session: ${errorData.message || response.statusText}`);
                });
            }
            return response.json();
        })
        .then((data) => {
            console.log('[Session Service] Session created:', data.data);
            return data.data;
        })
        .catch((error) => {
            console.error('[Session Service] Create session error:', error);
            throw error;
        });
}

function getStreamingSession(token, sessionId) {
    return fetch(`${base_url()}/v1/scribe/live-streaming/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((errorData) => {
                    throw new Error(`Failed to get session: ${errorData.message || response.statusText}`);
                });
            }
            return response.json();
        })
        .then((data) => {
            console.log('[Session Service] Session retrieved:', data.data);
            return data.data;
        })
        .catch((error) => {
            console.error('[Session Service] Get session error:', error);
            throw error;
        });
}

function getStreamingSessions(token) {
    return fetch(`${base_url()}/v1/scribe/live-streaming/sessions?session_status=CHANNEL_CREATED`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((errorData) => {
                    throw new Error(`Failed to get sessions: ${errorData.message || response.statusText}`);
                });
            }
            return response.json();
        })
        .then((data) => {
            console.log('[Session Service] Session retrieved:', data.data);
            return data.data;
        })
        .catch((error) => {
            console.error('[Session Service] Get session error:', error);
            throw error;
        });
}

function getChannelData(token, sessionId, role = 'VIEWER') {
    return fetch(`${base_url()}/v1/scribe/live-streaming/sessions/${sessionId}/channel_data?role=${role}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((errorData) => {
                    throw new Error(`Failed to get channel data: ${errorData.message || response.statusText}`);
                });
            }
            return response.json();
        })
        .then((data) => {
            console.log('[Session Service] Channel data retrieved:', data.data);
            return data.data;
        })
        .catch((error) => {
            console.error('[Session Service] Get channel data error:', error);
            throw error;
        });
}


function createSessionEvent(token, sessionId, eventType, eventData = {}, eventCount = 1) {
    return fetch(`${base_url()}/v1/scribe/live-streaming/sessions/${sessionId}/events`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            event_type: eventType,
            event_data: eventData,
            event_count: eventCount
        }),
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((errorData) => {
                    throw new Error(`Failed to create session event: ${errorData.message || response.statusText}`);
                });
            }
            return response.json();
        })
        .then((data) => {
            console.log(`[Session Service] Event ${eventType} sent:`, data.data);
            return data.data;
        })
        .catch((error) => {
            console.error(`[Session Service] Create session event error (${eventType}):`, error);
            throw error;
        });
}
