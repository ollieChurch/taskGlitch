const process = require('process')
import { initializeApp } from 'firebase/app';
import { getDatabase, ref } from 'firebase/database'

exports.handler = async function (event, context) {
    const { DATABASE_URL } = process.env
    const eventBody = JSON.parse(event.body)

    try {
        const app = initializeApp({ databaseURL: DATABASE_URL });
        const db = getDatabase(app);
        return {
            statusCode: 200,
            body: JSON.stringify({ ref: ref(db, `${eventBody.collection}/${netlifyIdentity.currentUser().id}`) }),
        };
    } catch (error) {
        console.log(error.message)
        return {
            statusCode: 500, body: JSON.stringify({
                error: error.message
            })
        }
    }
};