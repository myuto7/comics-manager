import https from 'https';

/**
 * SQS トリガーで起動し、LINE Messaging API で push 通知を送る Lambda 関数
 *
 * SQS メッセージボディの期待フォーマット:
 * {
 *   "title": "マンガタイトル",
 *   "creator": "入力者名",
 *   "mangadexUuid": "...",  // optional
 *   "thumbnail": "https://..."  // optional
 * }
 */
export const handler = async (event) => {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  // SQSからメッセージを取得
  for (const record of event.Records) {
    const message = JSON.parse(record.body);
    const { title, creator } = message;
    
    console.log('Processing message:', { title, creator });
    
    // LINE通知メッセージを作成（シンプルな形式）
    const lineMessage = creator 
      ? `新しい漫画が登録されました！\n\nタイトル: ${title}\n入力者: ${creator}`
      : `新しい漫画が登録されました！\n\nタイトル: ${title}`;
        
    // LINE Messaging APIにリクエスト送信
    await sendLineNotification(channelAccessToken, lineMessage);
  }
  
  return { statusCode: 200 };
};

function sendLineNotification(accessToken, message) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      messages: [
        {
          type: 'text',
          text: message
        }
      ]
    });
    
    console.log('Request body:', data);
    
    const options = {
      hostname: 'api.line.me',
      path: '/v2/bot/message/broadcast',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Length': Buffer.byteLength(data)
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log('LINE API response status:', res.statusCode);
        console.log('LINE API response body:', body);
        
        if (res.statusCode === 200) {
          console.log('LINE notification sent successfully');
          resolve();
        } else {
          console.error('LINE API error:', body);
          reject(new Error(`LINE API returned ${res.statusCode}: ${body}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}
