import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import crypto from 'crypto';

const client = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(client);

// Simple password hashing (use bcrypt in production)
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

    // Handle OPTIONS request for CORS
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

        // Check if user already exists
        const checkParams = {
            TableName: 'mood-tracker-users',
            IndexName: 'email-index',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': email
            }
        };

        const existingUser = await dynamoDB.send(new QueryCommand(checkParams));
        
        if (existingUser.Items.length > 0) {
            return {
                statusCode: 409,
                headers,
                body: JSON.stringify({ error: 'User already exists' })
            };
        }

        // Create new user
        const userId = crypto.randomUUID();
        const hashedPassword = hashPassword(password);
        
        const params = {
            TableName: 'mood-tracker-users',
            Item: {
                UserID: userId,
                email: email,
                password: hashedPassword,
                createdAt: new Date().toISOString()
            }
        };

        await dynamoDB.send(new PutCommand(params));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                userId: userId,
                message: 'User registered successfully'
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
