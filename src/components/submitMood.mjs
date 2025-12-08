import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        const body = JSON.parse(event.body);
        const { userId, mood, moodText, note } = body;

        if (!userId || !mood || !note) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'UserId, mood, and note are required' })
            };
        }

        const now = new Date();
        const timestamp = now.getTime();
        const dateStr = now.toLocaleString();

        const params = {
            TableName: 'mood-tracker-moods',
            Item: {
                UserID: userId,
                timestamp: timestamp,
                date: dateStr,
                mood: mood,
                moodText: moodText || '',
                note: note
            }
        };

        await dynamoDB.send(new PutCommand(params));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Mood recorded successfully',
                data: params.Item
            })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
