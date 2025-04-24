import { QueryParams } from './QueryParams';
import { RequestSigner } from './RequestSigner';

/**
 * Utility class for SigV4 signing requests. The AWS SDK cannot be used for this purpose because it does not have support for WebSocket endpoints.
 */
export class NormandySigner implements RequestSigner {
    /**
     * Creates a SigV4 signed WebSocket URL for the given host/endpoint with the given query params.
     *
     * @param endpoint The WebSocket service endpoint including protocol, hostname, and path (if applicable).
     * @param signedQueryParams
     *
     * Implementation note: Query parameters should be in alphabetical order.
     *
     * Note from AWS docs: "When you add the X-Amz-Security-Token parameter to the query string, some services require that you include this parameter in the
     * canonical (signed) request. For other services, you add this parameter at the end, after you calculate the signature. For details, see the API reference
     * documentation for that service." KVS Signaling Service requires that the session token is added to the canonical request.
     *
     * @see https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-query-string-auth.html
     * @see https://gist.github.com/prestomation/24b959e51250a8723b9a5a4f70dcae08
     *
     */


    public async getSignedURL(endpoint: string, signedQueryParams: QueryParams): Promise<string> {
        const filteredParams: QueryParams = Object.fromEntries(Object.entries(signedQueryParams).filter(([, value]) => value !== null));
        return endpoint + NormandySigner.createQueryString(filteredParams);
    }

    /**
     * Utility method for converting a map of query parameters to a string with the parameter names sorted.
     */
    private static createQueryString(queryParams: QueryParams): string {
        return Object.keys(queryParams)
            .sort()
            .map((key) => `${key}=${encodeURIComponent(queryParams[key])}`)
            .join('&');
    }
}
