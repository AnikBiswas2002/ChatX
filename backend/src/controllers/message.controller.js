import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import cloudinary from '../lib/cloudinary.js';
import {io, getReceiverSocketId } from '../lib/socket.js';

export const getUsersForSidebar = async (req, res) => {
try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({_id: {$ne: loggedInUserId}}).select("-password");
     // Assuming req.user is set by the protectRout
     res.status(200).json(filteredUsers);
} catch (error){
    console.log('Error in getUsersForSidebar:', error.message);
    res.status(500).json({ message: 'Server error, please try again later.' });
    
}
}

export const getMessages = async (req, res)=>{
    try {
        const { id: userToChatId} = req.params;
        const senderId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: senderId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: senderId }
            ]
        })
    
        res.status(200).json(messages);
    } catch (error) {
        console.log('Error in getMessages:', error.message);
        res.status(500).json({ message: 'Server error, please try again later.' });
    }
}

export const sendMessage = async (req, res) => {
    
    try {
        const {text, image} = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url; // Get the secure URL of the uploaded image
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl // Store the image URL if an image was uploaded
        });

        await newMessage.save();

        // realtime functionality goes here => socket.io
        const receiverSocketId=getReceiverSocketId(receiverId);
        if (receiverSocketId) {
           io.to(receiverSocketId).emit("newMessage",newMessage); 
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log('Error in sendMessage:', error.message);
        res.status(500).json({ message: 'Server error, please try again later.' });
    }
}