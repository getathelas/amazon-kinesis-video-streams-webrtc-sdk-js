/**
 * This file adapts the existing KVS WebRTC viewer logic to use the Athelas API
 * instead of direct AWS SDK calls for authentication and signaling
 */

// Store auth token and session data
let _authToken = null;
let _sessionData = null;
let _channelData = null;

// Replace original viewer function with API-based flow
async function startViewerWithApi(localView, remoteView, formValues, onStatsReport, remoteMessage) {
    try {
        console.log('[VIEWER ADAPTER] Starting viewer with API integration');
        viewerButtonPressed = new Date();

        // 1. Get form values
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            throw new Error('Username and password are required');
        }

        // Update UI to show loading state
        // ... (add loading indicator logic)

        // 2. Authenticate with API
        _authToken = await loginAndGetToken(username, password);
        console.log('[VIEWER ADAPTER] Authentication successful');

        // 3. Create a streaming session
        _sessionData = await createStreamingSession(_authToken);
        console.log('[VIEWER ADAPTER] Session created:', _sessionData.id);

        // 4. Get channel data for the session
        _channelData = await getChannelData(_authToken, _sessionData.id, 'VIEWER');
        console.log('[VIEWER ADAPTER] Channel data retrieved');

        // 5. Prepare WebRTC configuration
        const channelARN = _channelData.channel_arn;
        const clientId = formValues.clientId || Math.random().toString(36).substring(2, 15);

        // Format ICE servers for WebRTC
        const iceServers = _channelData.ice_servers.map((server) => ({
            urls: server.Uris,
            username: server.Username,
            credential: server.Password,
        }));

        // Find WSS endpoint
        const wssEndpoint = _channelData.endpoints.find((endpoint) => endpoint.Protocol === 'WSS')?.ResourceEndpoint;

        if (!wssEndpoint) {
            throw new Error('WSS endpoint not found in channel data');
        }

        // 6. Set up viewer object
        viewer.localView = localView;
        viewer.remoteView = remoteView;

        // 7. Create signaling client with API data
        const signalingClient = new KVSWebRTC.SignalingClient({
            channelARN,
            channelEndpoint: wssEndpoint,
            clientId,
            role: 'VIEWER',
            region: _channelData.region,
            systemClockOffset: 0,

            // Custom signaling parameters from the API
            requestSigner: {
                getSignedURL: async () => {
                    // Create WebSocket URL with signed params
                    const paramsObj = _channelData.signed_signaling_params;
                    const params = new URLSearchParams();

                    for (const [key, value] of Object.entries(paramsObj)) {
                        if (value !== null) {
                            params.append(key, value);
                        }
                    }

                    return `${wssEndpoint}?${params.toString()}`;
                },
            },
        });

        // 8. Create peer connection configuration
        const peerConnectionConfig = {
            iceServers,
            iceTransportPolicy: formValues.natTraversalDisabled ? 'all' : formValues.forceTURN ? 'relay' : formValues.forceSTUN ? 'all' : 'all',
        };

        // 9. Set up peer connection
        const peerConnection = new RTCPeerConnection(peerConnectionConfig);

        // 10. Call the existing viewer setup with these parameters
        // (Customized version of the old startViewer function without AWS SDK calls)
        await setupViewerConnection(signalingClient, peerConnection, formValues, onStatsReport, remoteMessage);

        return {
            signalingClient,
            peerConnection,
            sessionId: _sessionData.id,
        };
    } catch (error) {
        console.error('[VIEWER ADAPTER] Error starting viewer:', error);
        throw error;
    }
}
