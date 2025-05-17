/**
 * EventEmitter for session events
 */
const SessionEvents = {
    // Event types
    CHANNEL_CREATED: 'CHANNEL_CREATED',
    MDS_POLLED: 'MDS_POLLED',
    MDS_JOINED: 'MDS_JOINED',
    MDS_CONNECTED: 'MDS_CONNECTED',
    MDS_DISCONNECTED: 'MDS_DISCONNECTED',

    // Store for heartbeat timer
    _heartbeatTimer: null,
    _sessionId: null,
    _token: null,

    /**
     * Initialize the session event emitter
     * @param {string} token - Authorization token
     * @param {string} sessionId - ID of the streaming session
     */
    init(token, sessionId) {
        this._token = token;
        this._sessionId = sessionId;
        console.log('[Session Events] Initialized for session:', sessionId);
    },

    /**
     * Send a session event
     * @param {string} eventType - Type of the event (from SessionEvents constants)
     * @param {object|string} eventData - Data to include with the event
     * @param {number} eventCount - Event counter (default: 1)
     * @returns {Promise} - Promise that resolves when the event is sent
     */
    sendEvent(eventType, eventData = {}, eventCount = 1) {
        if (!this._token || !this._sessionId) {
            console.error('[Session Events] Cannot send event: session not initialized');
            return Promise.reject(new Error('Session not initialized'));
        }

        // Base64 encode the event data if it's an object
        const encodedData = typeof eventData === 'string' ? eventData : btoa(JSON.stringify(eventData));

        return createSessionEvent(this._token, this._sessionId, eventType, encodedData, eventCount);
    },

    /**
     * Send CHANNEL_CREATED event
     * @param {object} channelData - Data about the created channel
     * @returns {Promise} - Promise that resolves when the event is sent
     */
    channelCreated(channelData = {}) {
        return this.sendEvent(this.CHANNEL_CREATED, channelData);
    },

    /**
     * Send MDS_POLLED event
     * @param {object} pollData - Data about the poll operation
     * @returns {Promise} - Promise that resolves when the event is sent
     */
    mdsPolled(pollData = {}) {
        return this.sendEvent(this.MDS_POLLED, pollData);
    },

    /**
     * Send MDS_JOINED event
     * @param {object} joinData - Data about the join operation
     * @returns {Promise} - Promise that resolves when the event is sent
     */
    mdsJoined(joinData = {}) {
        return this.sendEvent(this.MDS_JOINED, joinData);
    },

    /**
     * Send MDS_CONNECTED event
     * @param {object} connectData - Data about the connection
     * @returns {Promise} - Promise that resolves when the event is sent
     */
    mdsConnected(connectData = {}) {
        return this.sendEvent(this.MDS_CONNECTED, connectData);
    },

    /**
     * Send MDS_DISCONNECTED event
     * @param {object} disconnectData - Data about the disconnection
     * @returns {Promise} - Promise that resolves when the event is sent
     */
    mdsDisconnected(disconnectData = {}) {
        return this.sendEvent(this.MDS_DISCONNECTED, disconnectData);
    },

    /**
     * Start sending MDS_CONNECTED heartbeat events at regular intervals
     * @param {number} intervalMs - Interval in milliseconds (default: 60000 = 1 minute)
     * @param {object} heartbeatData - Data to include with each heartbeat
     */
    startHeartbeat(intervalMs = 60000, heartbeatData = {}) {
        if (this._heartbeatTimer) {
            this.stopHeartbeat();
        }

        // Send initial heartbeat
        this.mdsConnected(heartbeatData).catch((error) => {
            console.error('[Session Events] Failed to send initial heartbeat:', error);
        });

        // Set up periodic heartbeat
        this._heartbeatTimer = setInterval(() => {
            this.mdsConnected(heartbeatData).catch((error) => {
                console.error('[Session Events] Failed to send heartbeat:', error);
                // Optionally stop heartbeat if there are persistent failures
            });
        }, intervalMs);

        console.log(`[Session Events] Started MDS_CONNECTED heartbeat (interval: ${intervalMs}ms)`);
    },

    /**
     * Stop sending heartbeat events
     */
    stopHeartbeat() {
        if (this._heartbeatTimer) {
            clearInterval(this._heartbeatTimer);
            this._heartbeatTimer = null;
            console.log('[Session Events] Stopped MDS_CONNECTED heartbeat');
        }
    },

    /**
     * Clean up resources when session ends
     */
    cleanup() {
        this.stopHeartbeat();
        this._token = null;
        this._sessionId = null;
        console.log('[Session Events] Cleaned up');
    },
};
