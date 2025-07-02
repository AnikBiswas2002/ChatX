import mongoose  from "mongoose";

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  profilePic: {
    type: String,
    default: "", // Default profile picture URL
  },
}, 
{
  timestamps: true, // Automatically manage createdAt and updatedAt fields
});

const User = mongoose.model("User", userSchema);
export default User;