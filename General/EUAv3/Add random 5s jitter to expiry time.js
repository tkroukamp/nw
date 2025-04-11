module.exports = a = async ({params}) => {
    console.log('params: ', params)

    try {
        // Validate input
        if (!params.safeRefreshTimeMs) {
            throw new Error('Missing required input: safeRefreshTimeMs')
        }

        const safeRefreshTimeMs = parseInt(params.safeRefreshTimeMs)

        if (isNaN(safeRefreshTimeMs)) {
            throw new Error('Invalid input: safeRefreshTimeMs must be a number')
        }

        // Generate random jitter between 1ms and 300000ms (5 minutes)
        const jitterMs = Math.floor(Math.random() * (300000 - 1 + 1)) + 1

        // Add jitter to the base time
        const jitteredRefreshTimeMs = safeRefreshTimeMs + jitterMs

        return {
            jitteredRefreshTimeMs
        }
    } catch (error) {
        console.error('Error:', error)
        throw new Error('Failed to apply jitter to refresh time: ' + error.message)
    }
}
