const axios = require("axios");
const FormData = require("form-data");
const WALog = require("../models/WALog");

class WAService {
 
  static async sendNotification({
    ticketId,
    recipientName,
    recipientRole,
    phoneNumber,
    messageType,
    messageContent,
    additionalOptions = {}
  }) {
    const log = await WALog.create({
      ticketId,
      recipientName,
      recipientRole,
      phoneNumber,
      messageType,
      messageContent,
      status: "PENDING",
    });

    try {
      const form = new FormData();
      form.append("target", phoneNumber);
      form.append("message", messageContent);
      form.append("countryCode", "62"); 
      form.append("delay", "2");      

      if (additionalOptions.buttonJSON) {
        form.append("buttonJSON", JSON.stringify(additionalOptions.buttonJSON));
      }
      if (additionalOptions.templateJSON) {
        form.append("templateJSON", JSON.stringify(additionalOptions.templateJSON));
      }

      const response = await axios.post("https://api.fonnte.com/send", form, {
        headers: {
          Authorization: process.env.FONNTE_TOKEN,
          ...form.getHeaders(),
        },
        timeout: 10000,
      });

      if (response.data && response.data.status === true) {
        log.status = "SENT";
        log.sentAt = new Date();
        await log.save();
        
        return { success: true, log };
      } else {
        log.status = "FAILED";
        log.errorMessage = response.data.reason || "Ditolak oleh sistem gateway Fonnte";
        await log.save();

        return { success: false, error: log.errorMessage };
      }

    } catch (error) {
      log.status = "FAILED";
      log.errorMessage = error.response?.data?.reason || error.message || "Kegagalan Koneksi HTTP Gateway";
      await log.save();

      return { success: false, error: log.errorMessage };
    }
  }
}

module.exports = WAService;