const Contact = require("../models/contact.model");

// @desc    Submit contact message from website form
// @route   POST /api/contact
// @access  Public
exports.createContactMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (Name, Email, Subject, Message)",
      });
    }

    const newContact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      subject: subject.trim(),
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Thank you! Your message has been sent successfully. Our team will get back to you shortly.",
      data: newContact,
    });
  } catch (error) {
    console.error("Create Contact Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error submitting contact message. Please try again.",
    });
  }
};

// @desc    Get all contact messages (Admin)
// @route   GET /api/contact
// @access  Private (Admin)
exports.getAllContactMessages = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    const messages = await Contact.find(query).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("Get All Contacts Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching contact messages",
    });
  }
};

// @desc    Update contact message status (Admin)
// @route   PATCH /api/contact/:id/status
// @access  Private (Admin)
exports.updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["unread", "read", "replied"];

    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed values: unread, read, replied",
      });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    contact.status = status;
    await contact.save();

    return res.json({
      success: true,
      message: `Message status updated to ${status}`,
      data: contact,
    });
  } catch (error) {
    console.error("Update Contact Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating message status",
    });
  }
};

// @desc    Delete contact message (Admin)
// @route   DELETE /api/contact/:id
// @access  Private (Admin)
exports.deleteContactMessage = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    await contact.deleteOne();

    return res.json({
      success: true,
      message: "Contact message deleted successfully",
    });
  } catch (error) {
    console.error("Delete Contact Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting contact message",
    });
  }
};
