import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import crypto from 'crypto';

const client = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(client);

const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

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
        const { email, password } = body;

        if (!email || !password) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Email and password are required' })
            };
        }

        // Query user by email using GSI
        const params = {
            TableName: 'mood-tracker-users',
            IndexName: 'email-index',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': email
            }
        };

        const result = await dynamoDB.send(new QueryCommand(params));

        if (result.Items.length === 0) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Invalid credentials' })
            };
        }

        const user = result.Items[0];
        const hashedPassword = hashPassword(password);

        if (user.password !== hashedPassword) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Invalid credentials' })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                userId: user.UserID,
                email: user.email,
                message: 'Login successful'
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
