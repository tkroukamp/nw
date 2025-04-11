module.exports = a = async ({params}) => {
    console.log('params: ', params)

    try {
        // Validate required parameters
        if (!params.currentTimestamp || !params.tokenExpiresIn) {
            throw new Error('Missing required input: currentTimestamp or tokenExpiresIn')
        }

        // Parse and validate input
        const currentTimestamp = parseInt(params.currentTimestamp)
        const tokenExpiresIn = parseInt(params.tokenExpiresIn) // in seconds

        if (isNaN(currentTimestamp) || isNaN(tokenExpiresIn)) {
            throw new Error('Invalid input: currentTimestamp and tokenExpiresIn must be numbers')
        }

        // Convert tokenExpiresIn to milliseconds and subtract 30 minutes (1800000 ms)
        const safeRefreshTimeMs = currentTimestamp + (tokenExpiresIn * 1000) - 1800000

        return {
            safeRefreshTimeMs
        }
    } catch (error) {
        console.error('Error:', error)
        throw new Error('Failed to calculate safe refresh time: ' + error.message)
    }
}
