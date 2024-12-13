import mongoose from "mongoose";

mongoose.set('strictQuery', true);

const Connection = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/mern-cloud", { useNewUrlParser: true })
        console.log(`Connected to Database Successfully`);
    } catch (error) {
        console.log('Disconnected', error);
    }
}

export default Connection;