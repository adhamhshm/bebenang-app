// imports the Mongoose library, allowing you to work with MongoDB in your application.
import mongoose, { mongo } from "mongoose";

// Various fields are defined, including id, username, name, image, bio, 
// threads, onboarded, and communities. Each field is specified with its data type and, 
// where applicable, additional options like required, unique, and default.

// threads and communities are defined as arrays of mongoose.Schema.Types.ObjectId to 
// represent relationships to other documents (threads and communities, respectively) in 
// your MongoDB database. The ref property specifies the name of the referenced model.
const userSchema = new mongoose.Schema({
    id: { type: String, required: true},
    username: { type: String, required: true, unique: true},
    name: { type: String, required: true},
    image: String,
    bio: String,
    threads: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Thread",
        }
    ],
    onboarded: {
        type: Boolean,
        default: false,
    },
    communities: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Community",
        }
    ]
});

// Here, you define the User model. If the User model already exists (possibly 
// because it was defined elsewhere in your application), you reuse it. 
// Otherwise, you create a new model using mongoose.model. This pattern is 
// often used to ensure that you don't redefine models if they've already been defined in your application.
const User = mongoose.models.User || mongoose.model("User", userSchema);

// This exports the User model so that you can import and use it in other parts of your application.
export default User;