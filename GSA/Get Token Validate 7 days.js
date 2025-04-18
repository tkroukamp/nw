module.exports = a = async ({params}) => {
    console.log('params: ', params);
    try {
        if (!params.input) {
            throw new Error("Missing input.");
        }

        // Parse input assuming it's a JSON array with a single string
        let parsed;
        try {
            parsed = JSON.parse(params.input);
        } catch (e) {
            throw new Error("Input must be a valid JSON string array, e.g. [\"token\"]");
        }

        if (!Array.isArray(parsed) || parsed.length !== 1 || typeof parsed[0] !== 'string') {
            throw new Error("Expected input format: [\"<token string>\"]");
        }

        const token = parsed[0].trim();

        // Validate JWT format
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error("Invalid JWT format. Expected three parts.");
        }

        const [headerB64, payloadB64] = parts;

        // Decode Base64URL to JSON
        const base64urlDecode = (str) => {
            const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
            const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
            const json = Buffer.from(padded, 'base64').toString('utf8');
            return JSON.parse(json);
        };

        const header = base64urlDecode(headerB64);
        const payload = base64urlDecode(payloadB64);

        if (!header.kid) {
            throw new Error("Missing 'kid' in token header.");
        }

        if (!payload.iat) {
            throw new Error("Missing 'iat' in token payload.");
        }

        const iatDate = new Date(payload.iat * 1000);
        const expiryDate = new Date(iatDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        const now = new Date();

        if (now > expiryDate) {
            throw new Error("Token is older than 7 days.");
        }

        return {
            token,
            kid: header.kid,
            issuedAt: iatDate.toISOString(),
            validUntil: expiryDate.toISOString()
        };

    } catch (error) {
        console.error("Error processing token:", error.message);
        throw new Error(error.message);
    }
};
