const axios = require('axios');
const FormData = require('form-data');

module.exports = {
    config: {
        name: "imgbb",
        aliases: ["i", "ibb", "upload"],
        version: "3.1.0",
        author: "Xalman",
        countDown: 5,
        role: 0,
        shortDescription: "Convert image to link",
        longDescription: "Uploads a replied image to ImgBB and returns a direct link.",
        category: "image",
        guide: {
            en: "{pn} [reply to an image]"
        }
    },

    onStart: async function ({ api, event, message }) {
        const { threadID, messageID, type, messageReply } = event;

        if (type !== "message_reply" || !messageReply.attachments[0] || messageReply.attachments[0].type !== "photo") {
            return message.reply("❌ Please reply to an image to upload.");
        }

        const imageUrl = messageReply.attachments[0].url;

        try {
            api.setMessageReaction("🕑", messageID, (err) => {}, true);

            const githubLink = "https://raw.githubusercontent.com/goatbotnx/Sexy-nx2.0Updated/refs/heads/main/nx-apis.json";
            const configRes = await axios.get(githubLink);
            const apiBaseUrl = configRes.data.imgbb; 
            
            if (!apiBaseUrl) throw new Error("API URL not found in configuration.");

            const finalEndpoint = `${apiBaseUrl.replace(/\/$/, "")}/upload`;
            const imageRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(imageRes.data);
            const form = new FormData();
            form.append('image', buffer, { filename: 'xalman_upload.jpg' });
            
            const response = await axios.post(finalEndpoint, form, {
                headers: form.getHeaders()
            });

            if (response.data && response.data.url) {
                api.setMessageReaction("✅", messageID, (err) => {}, true);
                return message.reply(`✅ Upload Success!\n\n🔗 Link: ${response.data.url}`);
            } else {
                throw new Error("Upload failed. No URL returned.");
            }

        } catch (error) {
            console.error(error);
            api.setMessageReaction("❌", messageID, (err) => {}, true);
            
            let errorMsg = error.message;
            if (error.response && error.response.status === 404) {
                errorMsg = "Server endpoint not found (404). Check if your Render app is sleeping.";
            }
            return message.reply(`⚠️ Error: ${errorMsg}`);
        }
    }
};
