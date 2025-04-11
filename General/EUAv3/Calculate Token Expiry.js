module.exports = a = async ({params}) => {
    console.log('params: ', params)

    try {
        const now = new Date();
        now.setTime(params.currentTimestamp);
        now.setHours(now.getHours() + 3);
 //         now.setMinutes(now.getMinutes() + 2);

        return {
            safeRefreshTimeMs: now.getTime(),
        }
    } catch (error) {
        console.error('Error:', error)
        throw new Error('Failed to calculate access token expiry: ' + error.message)
    }
}
