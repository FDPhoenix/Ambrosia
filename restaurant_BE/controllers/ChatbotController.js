const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const path = require('path');

require('dotenv').config();

const projectId = 'restaurantchatbot-rw9q';
const keyPath = path.join(__dirname, '../dialogflow-key.json');
const sessionClient = new dialogflow.SessionsClient({ keyFilename: keyPath });

exports.sendMessage = async (req, res) => {
    const { message } = req.body;
    const sessionId = uuid.v4();
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: message,
                languageCode: "vi,en",
            },
        },
    };

    try {
        const [response] = await sessionClient.detectIntent(request);
        const result = response.queryResult;

        console.log("Dialogflow Response:", JSON.stringify(result, null, 2));

        let reply = "";
        let buttons = [];

        result.fulfillmentMessages.forEach((message) => {
            if (message.text) {
                reply = message.text.text[0] || "";
            }

            if (message.payload?.fields?.richContent) {
                const richContent = message.payload.fields.richContent.listValue.values || [];

                // Duyệt vào listValue bên trong
                buttons = richContent.flatMap((outerItem) =>
                    (outerItem.listValue?.values || []).map((innerItem) => {
                        const structFields = innerItem.structValue?.fields || {};
                        return {
                            title: structFields.title?.stringValue || "",  // Lấy tiêu đề
                            text: structFields.text?.stringValue || "",
                            link: structFields.link?.stringValue || "",
                        };
                    })
                );
            }
        });

        return res.json({ reply, buttons });
    } catch (err) {
        console.error("Dialogflow Error:", err);
        return res.status(500).json({ reply: "Xin lỗi, tôi không hiểu câu hỏi của bạn." });
    }
};
