const Contact = require('../models/contact.modal')

exports.createContact = async (req, res) => {
    try {
      const { Name, Email, PhoneNumber, Message } = req.body;
  
      // Validate request data (you might want to add more validation)
      if (!Name || !Email || !PhoneNumber || !Message) {
        return res.status(400).json({ error: 'Please provide all required fields.' });
      }
  
      const newContact = new Contact({
        Name,
        Email,
        PhoneNumber,
        Message,
      });
  
      // Save the new contact to the database
      await newContact.save();
  
      res.status(201).json({ message: 'Contact created successfully.' });
    } catch (error) {
      console.error('Error creating contact:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  };
  
  exports.getContacts = async (req, res) => {
    try {
      const contacts = await Contact.find();
      res.status(200).json(contacts);
    } catch (error) {
      console.error('Error retrieving contacts:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  };

  exports.deleteMail = async (req, res) => {
    try {
        const MailId = req.params.id;
        const result = await Contact.deleteOne({ _id: MailId });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "No Product found with the given ID!"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product has been deleted!",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};